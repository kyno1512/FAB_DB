using System.Net.Http.Json;
using System.Security.Cryptography;
using AutoMapper;
using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using FAB.Server.Options;
using FAB.Server.Services.Email;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System.Text;

namespace FAB.Server.Services.Auth;

public class AuthService : IAuthService
{
    private readonly FabDbContext _context;
    private readonly IMapper _mapper;
    private readonly IMemoryCache _cache;
    private readonly IEmailService _emailService;
    private readonly IHostEnvironment _environment;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IOptions<GoogleAuthOptions> _googleAuthOptions;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        FabDbContext context,
        IMapper mapper,
        IMemoryCache cache,
        IEmailService emailService,
        IHostEnvironment environment,
        IJwtTokenService jwtTokenService,
        IOptions<GoogleAuthOptions> googleAuthOptions,
        IHttpClientFactory httpClientFactory,
        ILogger<AuthService> logger)
    {
        _context = context;
        _mapper = mapper;
        _cache = cache;
        _emailService = emailService;
        _environment = environment;
        _jwtTokenService = jwtTokenService;
        _googleAuthOptions = googleAuthOptions;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    // Đăng nhập: kiểm tra email + mật khẩu → trả thông tin user và token
    public async Task<ServiceResult<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        if (AuthRules.ValidateLogin(request) is { } error)
            return ServiceResult<LoginResponse>.Fail(error);

        var email = StringNormalizer.NormalizeEmail(request.Email);
        var user = await FindActiveUserAsync(email, ct);

        if (user is null || user.MatKhau != request.Password.Trim())
            return ServiceResult<LoginResponse>.Fail("Email hoặc mật khẩu không đúng.");

        return ServiceResult<LoginResponse>.Ok(CreateLoginResponse(user));
    }

    // Đăng ký: tạo NguoiDung (vai trò KhachHang) + KhachHang → trả LoginResponse như đăng nhập luôn
    public async Task<ServiceResult<LoginResponse>> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (AuthRules.ValidateRegister(request) is { } error)
            return ServiceResult<LoginResponse>.Fail(error);

        var email = StringNormalizer.NormalizeEmail(request.Email);

        if (await _context.NguoiDungs.AnyAsync(x => x.Email == email, ct))
            return ServiceResult<LoginResponse>.Fail("Email đã được sử dụng.");

        var roleId = await _context.VaiTros
            .Where(x => x.TenVaiTro == AuthConstants.KhachHangRole && x.TrangThai)
            .Select(x => (int?)x.MaVaiTro)
            .FirstOrDefaultAsync(ct);

        if (roleId is null)
            return ServiceResult<LoginResponse>.Fail("Vai trò khách hàng chưa được cấu hình trong hệ thống.");

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var user = _mapper.Map<NguoiDung>(request);
            user.MaVaiTro = roleId.Value;

            _context.NguoiDungs.Add(user);
            await _context.SaveChangesAsync(ct);

            await UpsertCustomerAsync(request, user, email, ct);
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            await _context.Entry(user).Reference(x => x.MaVaiTroNavigation).LoadAsync(ct);
            return ServiceResult<LoginResponse>.Ok(CreateLoginResponse(user));
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    // Quên mật khẩu: gửi OTP qua email → user tự đặt mật khẩu mới (không cấp mật khẩu)
    public async Task<ServiceResult<AuthMessageResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default)
    {
        if (AuthRules.ValidateForgotPassword(request) is { } error)
            return ServiceResult<AuthMessageResponse>.Fail(error);

        var email = StringNormalizer.NormalizeEmail(request.Email);
        var exists = await _context.NguoiDungs.AnyAsync(x => x.Email == email && x.TrangThai, ct);

        if (!exists)
            return ServiceResult<AuthMessageResponse>.Fail("Email không tồn tại trong hệ thống hoặc tài khoản đã bị khóa.");

        var otp = CreateResetToken(email);

        try
        {
            var body =
                $"Xin chào,\n\n" +
                $"Bạn đã yêu cầu đổi mật khẩu cho tài khoản Flygo.\n\n" +
                $"Mã OTP của bạn: {otp}\n\n" +
                $"Dùng mã này trên trang \"Đặt lại mật khẩu\" để tự tạo mật khẩu mới.\n" +
                $"Hệ thống không gửi sẵn mật khẩu — bạn sẽ tự chọn mật khẩu mới.\n\n" +
                $"Mã OTP có hiệu lực trong {AuthConstants.ResetTokenExpiryMinutes} phút.\n" +
                $"Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n\n" +
                $"— Flygo";

            await _emailService.SendAsync(email, "Mã OTP đổi mật khẩu Flygo", body, cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gửi email OTP thất bại cho {Email}", email);
            return ServiceResult<AuthMessageResponse>.Fail("Không thể gửi email OTP. Vui lòng thử lại sau.");
        }

        var response = new AuthMessageResponse
        {
            Message = $"Mã OTP đã được gửi tới {email}. Hãy dùng OTP để tự đặt mật khẩu mới (hiệu lực {AuthConstants.ResetTokenExpiryMinutes} phút).",
            OtpSent = true,
        };

        if (_environment.IsDevelopment())
            response.Otp = otp;

        return ServiceResult<AuthMessageResponse>.Ok(response);
    }

    // Đặt lại mật khẩu: xác thực OTP + email → user tự nhập mật khẩu mới
    public async Task<ServiceResult> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        if (AuthRules.ValidateResetPassword(request) is { } error)
            return ServiceResult.Fail(error);

        var email = StringNormalizer.NormalizeEmail(request.Email);

        if (!IsValidResetToken(email, request.Token))
            return ServiceResult.Fail("Mã OTP không hợp lệ hoặc đã hết hạn.");

        var user = await _context.NguoiDungs
            .FirstOrDefaultAsync(x => x.Email == email && x.TrangThai, ct);

        if (user is null)
            return ServiceResult.Fail("Không tìm thấy tài khoản.");

        user.MatKhau = request.NewPassword.Trim();
        await _context.SaveChangesAsync(ct);
        ClearResetToken(email);

        return ServiceResult.Ok("Đặt lại mật khẩu thành công.");
    }

    public async Task<ServiceResult<ProfileResponse>> GetProfileAsync(int maNguoiDung, CancellationToken ct = default)
    {
        if (maNguoiDung <= 0)
            return ServiceResult<ProfileResponse>.Fail("Mã người dùng không hợp lệ.");

        var user = await _context.NguoiDungs
            .Include(x => x.MaVaiTroNavigation)
            .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung && x.TrangThai, ct);

        if (user is null)
            return ServiceResult<ProfileResponse>.Fail("Không tìm thấy tài khoản.");

        var customer = await _context.KhachHangs
            .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung, ct);

        var profile = new ProfileResponse
        {
            MaNguoiDung = user.MaNguoiDung,
            HoTen = user.HoTen,
            Email = user.Email,
            SoDienThoai = user.SoDienThoai ?? customer?.SoDienThoai,
            AnhDaiDien = user.AnhDaiDien,
            TenVaiTro = user.MaVaiTroNavigation?.TenVaiTro ?? string.Empty,
            NgayTao = user.NgayTao,
            MaKhachHang = customer?.MaKhachHang,
            DiaChi = customer?.DiaChi,
            DiemTichLuy = customer?.DiemTichLuy ?? 0,
            NgaySinh = customer?.NgaySinh?.ToString("dd/MM/yyyy"),
        };

        return ServiceResult<ProfileResponse>.Ok(profile);
    }

    public async Task<ServiceResult<ProfileResponse>> UpdateProfileAsync(
        int maNguoiDung, UpdateProfileRequest request, CancellationToken ct = default)
    {
        if (AuthRules.ValidateUpdateProfile(request) is { } error)
            return ServiceResult<ProfileResponse>.Fail(error);

        var user = await _context.NguoiDungs
            .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung && x.TrangThai, ct);

        if (user is null)
            return ServiceResult<ProfileResponse>.Fail("Không tìm thấy tài khoản.");

        user.HoTen = request.HoTen.Trim();
        user.SoDienThoai = request.SoDienThoai.Trim();
        user.AnhDaiDien = string.IsNullOrWhiteSpace(request.AnhDaiDien)
            ? null
            : request.AnhDaiDien.Trim();

        var customer = await _context.KhachHangs
            .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung, ct);

        if (customer is null)
        {
            customer = new KhachHang
            {
                MaNguoiDung = maNguoiDung,
                HoTen = user.HoTen,
                Email = user.Email,
                SoDienThoai = user.SoDienThoai!,
                DiemTichLuy = 0,
                NgayTao = DateTime.Now,
            };
            _context.KhachHangs.Add(customer);
        }
        else
        {
            customer.HoTen = user.HoTen;
            customer.SoDienThoai = user.SoDienThoai!;
            customer.Email = user.Email;
        }

        customer.DiaChi = string.IsNullOrWhiteSpace(request.DiaChi) ? null : request.DiaChi.Trim();
        customer.NgaySinh = string.IsNullOrWhiteSpace(request.NgaySinh)
            ? null
            : DateOnly.Parse(request.NgaySinh);

        await _context.SaveChangesAsync(ct);
        return await GetProfileAsync(maNguoiDung, ct);
    }

    public async Task<ServiceResult> ChangePasswordAsync(
        int maNguoiDung, ChangePasswordRequest request, CancellationToken ct = default)
    {
        if (AuthRules.ValidateChangePassword(request) is { } error)
            return ServiceResult.Fail(error);

        var user = await _context.NguoiDungs
            .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung && x.TrangThai, ct);

        if (user is null)
            return ServiceResult.Fail("Không tìm thấy tài khoản.");

        if (user.MatKhau != request.CurrentPassword.Trim())
            return ServiceResult.Fail("Mật khẩu hiện tại không đúng.");

        user.MatKhau = request.NewPassword.Trim();
        await _context.SaveChangesAsync(ct);

        return ServiceResult.Ok("Đổi mật khẩu thành công.");
    }

    public string BuildGoogleAuthUrl(string returnUrl)
    {
        var options = _googleAuthOptions.Value;
        var state = Convert.ToBase64String(Encoding.UTF8.GetBytes(returnUrl ?? "/login"));
        var query = new Dictionary<string, string>
        {
            ["client_id"] = options.ClientId,
            ["redirect_uri"] = options.RedirectUri,
            ["response_type"] = "code",
            ["scope"] = "openid email profile",
            ["access_type"] = "offline",
            ["prompt"] = "consent",
            ["state"] = state,
        };

        return "https://accounts.google.com/o/oauth2/v2/auth?" + string.Join("&", query.Select(x => $"{Uri.EscapeDataString(x.Key)}={Uri.EscapeDataString(x.Value)}"));
    }

    public async Task<ServiceResult<LoginResponse>> HandleGoogleCallbackAsync(string code, string state, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return ServiceResult<LoginResponse>.Fail("Thiếu Google code.");

        var options = _googleAuthOptions.Value;
        var http = _httpClientFactory.CreateClient();
        var tokenRes = await http.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = options.ClientId,
            ["client_secret"] = options.ClientSecret,
            ["redirect_uri"] = options.RedirectUri,
            ["grant_type"] = "authorization_code",
        }), ct);

        if (!tokenRes.IsSuccessStatusCode)
        {
            var errorBody = await tokenRes.Content.ReadAsStringAsync(ct);
            return ServiceResult<LoginResponse>.Fail($"Không thể xác thực với Google: {errorBody}");
        }

        var token = await tokenRes.Content.ReadFromJsonAsync<GoogleTokenResponse>(cancellationToken: ct);
        if (token is null || string.IsNullOrWhiteSpace(token.IdToken))
            return ServiceResult<LoginResponse>.Fail("Google không trả về id_token.");

        var payload = await GoogleJsonWebSignature.ValidateAsync(token.IdToken);
        var email = StringNormalizer.NormalizeEmail(payload.Email);

        var user = await _context.NguoiDungs
            .Include(x => x.MaVaiTroNavigation)
            .FirstOrDefaultAsync(x => x.Email == email && x.TrangThai, ct);

        if (user is null)
        {
            var roleId = await _context.VaiTros
                .Where(x => x.TenVaiTro == AuthConstants.KhachHangRole && x.TrangThai)
                .Select(x => (int?)x.MaVaiTro)
                .FirstOrDefaultAsync(ct);

            if (roleId is null)
                return ServiceResult<LoginResponse>.Fail("Vai trò khách hàng chưa được cấu hình trong hệ thống.");

            user = new NguoiDung
            {
                HoTen = string.IsNullOrWhiteSpace(payload.Name) ? payload.Email : payload.Name.Trim(),
                Email = email,
                SoDienThoai = null,
                MatKhau = Guid.NewGuid().ToString("N"),
                AnhDaiDien = payload.Picture,
                MaVaiTro = roleId.Value,
                TrangThai = true,
                NgayTao = DateTime.Now,
            };

            _context.NguoiDungs.Add(user);
            await _context.SaveChangesAsync(ct);
            await _context.Entry(user).Reference(x => x.MaVaiTroNavigation).LoadAsync(ct);

            var customer = new KhachHang
            {
                MaNguoiDung = user.MaNguoiDung,
                HoTen = user.HoTen,
                Email = user.Email,
                SoDienThoai = string.Empty,
                DiaChi = null,
                DiemTichLuy = 0,
                NgayTao = DateTime.Now,
            };
            _context.KhachHangs.Add(customer);
            await _context.SaveChangesAsync(ct);
        }

        return ServiceResult<LoginResponse>.Ok(CreateLoginResponse(user));
    }

    private Task<NguoiDung?> FindActiveUserAsync(string email, CancellationToken ct) =>
        _context.NguoiDungs
            .Include(x => x.MaVaiTroNavigation)
            .FirstOrDefaultAsync(x => x.Email == email && x.TrangThai, ct);

    private async Task UpsertCustomerAsync(RegisterRequest request, NguoiDung user, string email, CancellationToken ct)
    {
        var phone = request.SoDienThoai.Trim();
        var existing = await _context.KhachHangs.FirstOrDefaultAsync(x =>
            x.MaNguoiDung == null &&
            (x.SoDienThoai == phone || (x.Email != null && x.Email == email)), ct);

        if (existing is not null)
        {
            _mapper.Map(request, existing);
            existing.MaNguoiDung = user.MaNguoiDung;
            return;
        }

        var customer = _mapper.Map<KhachHang>(request);
        customer.MaNguoiDung = user.MaNguoiDung;
        customer.DiemTichLuy = 0;
        customer.NgayTao = DateTime.Now;
        _context.KhachHangs.Add(customer);
    }

    private LoginResponse CreateLoginResponse(NguoiDung user)
    {
        var response = _mapper.Map<LoginResponse>(user);
        response.Token = _jwtTokenService.GenerateToken(user);
        return response;
    }

    private string CreateResetToken(string email)
    {
        var otp = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString($"D{AuthConstants.OtpLength}");
        _cache.Set(ResetCacheKey(email), otp, TimeSpan.FromMinutes(AuthConstants.ResetTokenExpiryMinutes));
        return otp;
    }

    private bool IsValidResetToken(string email, string token) =>
        _cache.TryGetValue(ResetCacheKey(email), out string? cached) &&
        string.Equals(cached, token.Trim(), StringComparison.Ordinal);

    private void ClearResetToken(string email) =>
        _cache.Remove(ResetCacheKey(email));

    private static string ResetCacheKey(string email) =>
        $"{AuthConstants.ResetTokenCachePrefix}{email}";

    public async Task<NguoiDung?> CheckAccountExistsAsync(string email, CancellationToken ct)
    {
        return await _context.NguoiDungs
            .Include(x => x.MaVaiTroNavigation)
            .FirstOrDefaultAsync(x => x.Email == email, ct);
    }

    public async Task<ServiceResult> ResetPasswordDebugAsync(string email, string newPassword, CancellationToken ct)
    {
        var user = await _context.NguoiDungs
            .FirstOrDefaultAsync(x => x.Email == email && x.TrangThai, ct);

        if (user is null)
            return ServiceResult.Fail("Không tìm thấy tài khoản.");

        user.MatKhau = newPassword.Trim();
        await _context.SaveChangesAsync(ct);

        return ServiceResult.Ok($"Đã reset mật khẩu cho {email}");
    }
}
