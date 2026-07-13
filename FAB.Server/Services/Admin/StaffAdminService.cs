using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FAB.Server.Services.Admin;

public class StaffAdminService : IStaffAdminService
{
    private readonly FabDbContext _context;
    private readonly ILogger<StaffAdminService> _logger;

    private static readonly string[] StaffRoleNames =
        ["Admin", "QuanLy", "NhanVien", "Shipper"];

    public StaffAdminService(FabDbContext context, ILogger<StaffAdminService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ServiceResult<List<RoleListItemDto>>> GetRolesAsync(CancellationToken ct = default)
    {
        var roles = await _context.VaiTros
            .AsNoTracking()
            .Where(r => r.TrangThai && StaffRoleNames.Contains(r.TenVaiTro))
            .OrderBy(r => r.TenVaiTro)
            .Select(r => new RoleListItemDto
            {
                MaVaiTro = r.MaVaiTro,
                TenVaiTro = r.TenVaiTro,
                MoTa = r.MoTa,
            })
            .ToListAsync(ct);

        return ServiceResult<List<RoleListItemDto>>.Ok(roles);
    }

    public async Task<ServiceResult<List<StaffListItemDto>>> GetAllAsync(string? search = null, CancellationToken ct = default)
    {
        var query = _context.NguoiDungs
            .Include(u => u.MaVaiTroNavigation)
            .AsNoTracking()
            .Where(u => StaffRoleNames.Contains(u.MaVaiTroNavigation!.TenVaiTro));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(u =>
                u.HoTen.Contains(keyword) ||
                u.Email.Contains(keyword) ||
                (!string.IsNullOrEmpty(u.SoDienThoai) && u.SoDienThoai.Contains(keyword)) ||
                u.MaVaiTroNavigation.TenVaiTro.Contains(keyword));
        }

        var staff = await query
            .OrderByDescending(u => u.NgayTao)
            .Select(u => new StaffListItemDto
            {
                MaNguoiDung = u.MaNguoiDung,
                HoTen = u.HoTen,
                Email = u.Email,
                SoDienThoai = u.SoDienThoai ?? string.Empty,
                MaVaiTro = u.MaVaiTro,
                TenVaiTro = u.MaVaiTroNavigation.TenVaiTro,
                TrangThai = u.TrangThai,
                NgayTao = u.NgayTao,
                MatKhau = u.MatKhau!,
            })
            .ToListAsync(ct);

        return ServiceResult<List<StaffListItemDto>>.Ok(staff);
    }

    public async Task<ServiceResult<StaffListItemDto>> GetByIdAsync(int maNguoiDung, CancellationToken ct = default)
    {
        var user = await _context.NguoiDungs
            .Include(u => u.MaVaiTroNavigation)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.MaNguoiDung == maNguoiDung, ct);

        if (user is null || !StaffRoleNames.Contains(user.MaVaiTroNavigation!.TenVaiTro))
            return ServiceResult<StaffListItemDto>.Fail("Không tìm thấy nhân sự.");

        return ServiceResult<StaffListItemDto>.Ok(new StaffListItemDto
        {
            MaNguoiDung = user.MaNguoiDung,
            HoTen = user.HoTen,
            Email = user.Email,
            SoDienThoai = user.SoDienThoai ?? string.Empty,
            MaVaiTro = user.MaVaiTro,
            TenVaiTro = user.MaVaiTroNavigation.TenVaiTro,
            TrangThai = user.TrangThai,
            NgayTao = user.NgayTao,
            MatKhau = user.MatKhau!,
        });
    }

    public async Task<ServiceResult<StaffListItemDto>> CreateAsync(CreateStaffRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.HoTen))
            return ServiceResult<StaffListItemDto>.Fail("Vui lòng nhập họ tên.");

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
            return ServiceResult<StaffListItemDto>.Fail("Email không hợp lệ.");

        if (string.IsNullOrWhiteSpace(request.SoDienThoai))
            return ServiceResult<StaffListItemDto>.Fail("Vui lòng nhập số điện thoại.");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < AuthConstants.MinPasswordLength)
            return ServiceResult<StaffListItemDto>.Fail($"Mật khẩu phải có ít nhất {AuthConstants.MinPasswordLength} ký tự.");

        var email = StringNormalizer.NormalizeEmail(request.Email);

        if (await _context.NguoiDungs.AnyAsync(u => u.Email == email, ct))
            return ServiceResult<StaffListItemDto>.Fail("Email đã được sử dụng.");

        var role = await _context.VaiTros
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.MaVaiTro == request.MaVaiTro && r.TrangThai, ct);

        if (role is null || !StaffRoleNames.Contains(role.TenVaiTro))
            return ServiceResult<StaffListItemDto>.Fail("Vai trò không hợp lệ.");

        var user = new NguoiDung
        {
            HoTen = request.HoTen.Trim(),
            Email = email,
            SoDienThoai = request.SoDienThoai.Trim(),
            MatKhau = request.Password.Trim(),
            MaVaiTro = role.MaVaiTro,
            TrangThai = true,
            NgayTao = DateTime.Now,
        };

        _context.NguoiDungs.Add(user);
        await _context.SaveChangesAsync(ct);

        return ServiceResult<StaffListItemDto>.Ok(new StaffListItemDto
        {
            MaNguoiDung = user.MaNguoiDung,
            HoTen = user.HoTen,
            Email = user.Email,
            SoDienThoai = user.SoDienThoai,
            MaVaiTro = user.MaVaiTro,
            TenVaiTro = role.TenVaiTro,
            TrangThai = user.TrangThai,
            NgayTao = user.NgayTao,
            MatKhau = user.MatKhau!,
        });
    }

    public async Task<ServiceResult<StaffListItemDto>> UpdateAsync(
        int maNguoiDung, UpdateStaffRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.HoTen))
            return ServiceResult<StaffListItemDto>.Fail("Vui lòng nhập họ tên.");

        if (string.IsNullOrWhiteSpace(request.SoDienThoai))
            return ServiceResult<StaffListItemDto>.Fail("Vui lòng nhập số điện thoại.");

        if (!string.IsNullOrWhiteSpace(request.Password) &&
            request.Password.Trim().Length < AuthConstants.MinPasswordLength)
            return ServiceResult<StaffListItemDto>.Fail($"Mật khẩu phải có ít nhất {AuthConstants.MinPasswordLength} ký tự.");

        var user = await _context.NguoiDungs
            .Include(u => u.MaVaiTroNavigation)
            .FirstOrDefaultAsync(u => u.MaNguoiDung == maNguoiDung, ct);

        if (user is null || !StaffRoleNames.Contains(user.MaVaiTroNavigation!.TenVaiTro))
            return ServiceResult<StaffListItemDto>.Fail("Không tìm thấy nhân sự.");

        var role = await _context.VaiTros
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.MaVaiTro == request.MaVaiTro && r.TrangThai, ct);

        if (role is null || !StaffRoleNames.Contains(role.TenVaiTro))
            return ServiceResult<StaffListItemDto>.Fail("Vai trò không hợp lệ.");

        user.HoTen = request.HoTen.Trim();
        user.SoDienThoai = request.SoDienThoai.Trim();
        user.MaVaiTro = role.MaVaiTro;
        user.TrangThai = request.TrangThai;

        if (!string.IsNullOrWhiteSpace(request.Password))
            user.MatKhau = request.Password.Trim();

        await _context.SaveChangesAsync(ct);

        return ServiceResult<StaffListItemDto>.Ok(new StaffListItemDto
        {
            MaNguoiDung = user.MaNguoiDung,
            HoTen = user.HoTen,
            Email = user.Email,
            SoDienThoai = user.SoDienThoai,
            MaVaiTro = user.MaVaiTro,
            TenVaiTro = role.TenVaiTro,
            TrangThai = user.TrangThai,
            NgayTao = user.NgayTao,
            MatKhau = user.MatKhau!,
        });
    }

    public async Task<ServiceResult> DeleteAsync(int maNguoiDung, CancellationToken ct = default)
    {
        var user = await _context.NguoiDungs
            .Include(u => u.MaVaiTroNavigation)
            .FirstOrDefaultAsync(u => u.MaNguoiDung == maNguoiDung, ct);

        if (user is null || !StaffRoleNames.Contains(user.MaVaiTroNavigation.TenVaiTro))
            return ServiceResult.Fail("Không tìm thấy nhân sự.");

        var hasWarehouseData =
            await _context.DonDatHangNhaps.AnyAsync(x => x.MaNguoiTao == maNguoiDung, ct) ||
            await _context.PhieuNhapKhos.AnyAsync(x => x.MaNguoiTao == maNguoiDung, ct) ||
            await _context.PhieuXuatKhos.AnyAsync(x => x.MaNguoiTao == maNguoiDung, ct) ||
            await _context.LichSuTonKhos.AnyAsync(x => x.NguoiThucHien == maNguoiDung, ct);

        if (hasWarehouseData)
            return ServiceResult.Fail("Nhân sự đã có dữ liệu kho. Hãy khóa tài khoản thay vì xóa.");

        var deliveries = await _context.GiaoHangs
            .Where(g => g.MaShipper == maNguoiDung)
            .ToListAsync(ct);
        foreach (var delivery in deliveries)
            delivery.MaShipper = null;

        var orders = await _context.DonHangs
            .Where(d => d.MaNguoiTao == maNguoiDung)
            .ToListAsync(ct);
        foreach (var order in orders)
            order.MaNguoiTao = null;

        var carts = await _context.GioHangs
            .Where(g => g.MaNguoiDung == maNguoiDung)
            .ToListAsync(ct);
        _context.GioHangs.RemoveRange(carts);

        var chats = await _context.LichSuChatAis
            .Where(c => c.MaNguoiDung == maNguoiDung)
            .ToListAsync(ct);
        _context.LichSuChatAis.RemoveRange(chats);

        var customers = await _context.KhachHangs
            .Where(k => k.MaNguoiDung == maNguoiDung)
            .ToListAsync(ct);
        foreach (var customer in customers)
            customer.MaNguoiDung = null;

        _context.NguoiDungs.Remove(user);
        await _context.SaveChangesAsync(ct);

        return ServiceResult.Ok("Đã xóa nhân sự.");
    }

    public async Task<ServiceResult<StaffModulePermissionsResponse>> GetModulePermissionsAsync(
        int maNguoiDung, CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("GetModulePermissionsAsync started for MaNguoiDung: {MaNguoiDung}", maNguoiDung);

            var user = await _context.NguoiDungs
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.MaNguoiDung == maNguoiDung, ct);

            _logger.LogInformation("User found: {UserId}, MaVaiTro: {MaVaiTro}", user?.MaNguoiDung, user?.MaVaiTro);

            if (user is null)
                return ServiceResult<StaffModulePermissionsResponse>.Fail("Không tìm thấy nhân sự.");

            var vaiTro = await _context.VaiTros
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.MaVaiTro == user.MaVaiTro, ct);

            if (vaiTro is null || !StaffRoleNames.Contains(vaiTro.TenVaiTro))
                return ServiceResult<StaffModulePermissionsResponse>.Fail("Nhân sự không có vai trò hoặc vai trò không hợp lệ.");

            _logger.LogInformation("Vai tro OK: {TenVaiTro}", vaiTro.TenVaiTro);

            // Lấy permission IDs từ bảng join VaiTro_Quyen dùng raw SQL trả về List<int>
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync(ct);
            var rolePermissionSet = new HashSet<int>();

            try
            {
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = "SELECT MaQuyen FROM VaiTro_Quyen WHERE MaVaiTro = @p0";
                    var param = cmd.CreateParameter();
                    param.ParameterName = "@p0";
                    param.Value = user.MaVaiTro;
                    cmd.Parameters.Add(param);

                    using (var reader = await cmd.ExecuteReaderAsync(ct))
                    {
                        while (await reader.ReadAsync(ct))
                        {
                            rolePermissionSet.Add(reader.GetInt32(0));
                        }
                    }
                }
            }
            finally
            {
                await connection.CloseAsync();
            }

            _logger.LogInformation("Role permission count: {Count}", rolePermissionSet.Count);

            _logger.LogInformation("Loading custom permissions");
            var customPermissions = await _context.PhanQuyenNguoiDungs
                .Where(p => p.MaNguoiDung == maNguoiDung)
                .ToDictionaryAsync(p => p.MaQuyen, p => p.Tat, ct);

            _logger.LogInformation("Loading all permissions");
            var allPermissions = await _context.Quyens
                .AsNoTracking()
                .OrderBy(q => q.TenQuyen)
                .ToListAsync(ct);

            var permissions = allPermissions
                .Where(q => q.Module != null)
            .Select(q => new ModulePermissionDto
            {
                MaQuyen = q.MaQuyen,
                TenQuyen = q.TenQuyen,
                MoTa = q.MoTa,
                Module = q.Module,
                Tat = customPermissions.TryGetValue(q.MaQuyen, out var customTat)
                    ? customTat
                    : !rolePermissionSet.Contains(q.MaQuyen),
            })
            .ToList();

        return ServiceResult<StaffModulePermissionsResponse>.Ok(new StaffModulePermissionsResponse
        {
            MaNguoiDung = user.MaNguoiDung,
            HoTen = user.HoTen,
            IsAdmin = vaiTro.TenVaiTro == "Admin",
            Permissions = permissions,
        });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetModulePermissionsAsync for MaNguoiDung: {MaNguoiDung}", maNguoiDung);
            throw;
        }
    }

    public async Task<ServiceResult> UpdateModulePermissionsAsync(
        int maNguoiDung, UpdateStaffPermissionsRequest request, CancellationToken ct = default)
    {
        var user = await _context.NguoiDungs
            .Include(u => u.MaVaiTroNavigation)
            .FirstOrDefaultAsync(u => u.MaNguoiDung == maNguoiDung, ct);

        if (user is null || !StaffRoleNames.Contains(user.MaVaiTroNavigation!.TenVaiTro))
            return ServiceResult.Fail("Không tìm thấy nhân sự.");

        var existing = await _context.PhanQuyenNguoiDungs
            .Where(p => p.MaNguoiDung == maNguoiDung)
            .ToListAsync(ct);
        _context.PhanQuyenNguoiDungs.RemoveRange(existing);

        foreach (var perm in request.Permissions)
        {
            _context.PhanQuyenNguoiDungs.Add(new PhanQuyenNguoiDung
            {
                MaNguoiDung = maNguoiDung,
                MaQuyen = perm.MaQuyen,
                Tat = perm.Tat,
            });
        }

        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok("Đã cập nhật quyền.");
    }
}
