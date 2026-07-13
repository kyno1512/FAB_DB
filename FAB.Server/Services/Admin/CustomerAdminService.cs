using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models.DTOs;
using FAB.Server.Services.Auth;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Admin;

public class CustomerAdminService : ICustomerAdminService
{
    private readonly FabDbContext _context;

    public CustomerAdminService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<PagedResult<CustomerListItemDto>>> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _context.KhachHangs
            .Include(k => k.MaNguoiDungNavigation)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(k =>
                k.HoTen.Contains(keyword) ||
                k.SoDienThoai.Contains(keyword) ||
                (k.Email != null && k.Email.Contains(keyword)) ||
                (k.DiaChi != null && k.DiaChi.Contains(keyword)));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(k => k.NgayTao)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(k => new CustomerListItemDto
            {
                MaKhachHang = k.MaKhachHang,
                MaNguoiDung = k.MaNguoiDung,
                HoTen = k.HoTen,
                SoDienThoai = k.SoDienThoai,
                Email = k.Email,
                DiaChi = k.DiaChi,
                DiemTichLuy = k.DiemTichLuy,
                CoTaiKhoan = k.MaNguoiDung != null,
                TrangThai = k.MaNguoiDungNavigation == null || k.MaNguoiDungNavigation.TrangThai,
                SoDonHang = k.DonHangs.Count,
                NgayTao = k.NgayTao,
            })
            .ToListAsync(ct);

        return ServiceResult<PagedResult<CustomerListItemDto>>.Ok(new PagedResult<CustomerListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        });
    }

    public async Task<ServiceResult<CustomerDetailResponse>> GetByIdAsync(int maKhachHang, CancellationToken ct = default)
    {
        var customer = await _context.KhachHangs
            .Include(k => k.MaNguoiDungNavigation)
            .Include(k => k.DonHangs)
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.MaKhachHang == maKhachHang, ct);

        if (customer is null)
            return ServiceResult<CustomerDetailResponse>.Fail("Không tìm thấy khách hàng.");

        return ServiceResult<CustomerDetailResponse>.Ok(MapDetail(customer));
    }

    public async Task<ServiceResult<CustomerDetailResponse>> UpdateAsync(
        int maKhachHang, UpdateCustomerRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.HoTen))
            return ServiceResult<CustomerDetailResponse>.Fail("Vui lòng nhập họ tên.");

        if (string.IsNullOrWhiteSpace(request.SoDienThoai))
            return ServiceResult<CustomerDetailResponse>.Fail("Vui lòng nhập số điện thoại.");

        if (request.DiemTichLuy < 0)
            return ServiceResult<CustomerDetailResponse>.Fail("Điểm tích lũy không hợp lệ.");

        if (!string.IsNullOrWhiteSpace(request.Password) &&
            request.Password.Trim().Length < AuthConstants.MinPasswordLength)
            return ServiceResult<CustomerDetailResponse>.Fail(
                $"Mật khẩu phải có ít nhất {AuthConstants.MinPasswordLength} ký tự.");

        var customer = await _context.KhachHangs
            .Include(k => k.MaNguoiDungNavigation)
            .FirstOrDefaultAsync(k => k.MaKhachHang == maKhachHang, ct);

        if (customer is null)
            return ServiceResult<CustomerDetailResponse>.Fail("Không tìm thấy khách hàng.");

        customer.HoTen = request.HoTen.Trim();
        customer.SoDienThoai = request.SoDienThoai.Trim();
        customer.Email = StringNormalizer.TrimOrNull(request.Email);
        customer.DiaChi = StringNormalizer.TrimOrNull(request.DiaChi);
        customer.DiemTichLuy = request.DiemTichLuy;

        if (customer.MaNguoiDungNavigation is not null)
        {
            customer.MaNguoiDungNavigation.HoTen = customer.HoTen;
            customer.MaNguoiDungNavigation.SoDienThoai = customer.SoDienThoai;
            customer.MaNguoiDungNavigation.TrangThai = request.TrangThai;

            if (!string.IsNullOrWhiteSpace(request.Password))
                customer.MaNguoiDungNavigation.MatKhau = request.Password.Trim();
        }

        await _context.SaveChangesAsync(ct);

        await _context.Entry(customer).Collection(k => k.DonHangs).LoadAsync(ct);
        return ServiceResult<CustomerDetailResponse>.Ok(MapDetail(customer));
    }

    public async Task<ServiceResult> DeleteAsync(int maKhachHang, CancellationToken ct = default)
    {
        var customer = await _context.KhachHangs
            .Include(k => k.MaNguoiDungNavigation).ThenInclude(u => u!.MaVaiTroNavigation)
            .Include(k => k.DonHangs)
            .FirstOrDefaultAsync(k => k.MaKhachHang == maKhachHang, ct);

        if (customer is null)
            return ServiceResult.Fail("Không tìm thấy khách hàng.");

        foreach (var order in customer.DonHangs)
            order.MaKhachHang = null;

        var user = customer.MaNguoiDungNavigation;
        if (user is not null)
        {
            var carts = await _context.GioHangs.Where(g => g.MaNguoiDung == user.MaNguoiDung).ToListAsync(ct);
            _context.GioHangs.RemoveRange(carts);

            var chats = await _context.LichSuChatAis.Where(c => c.MaNguoiDung == user.MaNguoiDung).ToListAsync(ct);
            _context.LichSuChatAis.RemoveRange(chats);

            _context.KhachHangs.Remove(customer);
            await _context.SaveChangesAsync(ct);

            if (user.MaVaiTroNavigation.TenVaiTro == AuthConstants.KhachHangRole)
            {
                _context.NguoiDungs.Remove(user);
                await _context.SaveChangesAsync(ct);
            }

            return ServiceResult.Ok("Đã xóa khách hàng.");
        }

        _context.KhachHangs.Remove(customer);
        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok("Đã xóa khách hàng.");
    }

    public async Task<ServiceResult> DeleteManyAsync(IReadOnlyList<int> ids, CancellationToken ct = default)
    {
        if (ids is null || ids.Count == 0)
            return ServiceResult.Fail("Chưa chọn khách hàng nào.");

        var distinctIds = ids.Distinct().ToList();
        var deleted = 0;
        var errors = new List<string>();

        foreach (var id in distinctIds)
        {
            var result = await DeleteAsync(id, ct);
            if (result.Success)
                deleted++;
            else
                errors.Add($"#{id}: {result.Message}");
        }

        if (deleted == 0)
            return ServiceResult.Fail(string.Join(" ", errors));

        var message = $"Đã xóa {deleted} khách hàng.";
        if (errors.Count > 0)
            message += $" Không xóa được {errors.Count} khách: {string.Join("; ", errors)}";

        return ServiceResult.Ok(message);
    }

    public async Task<ServiceResult> ResetPasswordAsync(
        int maKhachHang, AdminResetPasswordRequest request, CancellationToken ct = default)
    {
        if (AuthRules.ValidateAdminResetPassword(request) is { } error)
            return ServiceResult.Fail(error);

        var customer = await _context.KhachHangs
            .Include(k => k.MaNguoiDungNavigation)
            .FirstOrDefaultAsync(k => k.MaKhachHang == maKhachHang, ct);

        if (customer is null)
            return ServiceResult.Fail("Không tìm thấy khách hàng.");

        if (customer.MaNguoiDungNavigation is null)
            return ServiceResult.Fail("Khách hàng chưa có tài khoản đăng nhập.");

        if (!customer.MaNguoiDungNavigation.TrangThai)
            return ServiceResult.Fail("Tài khoản đang bị khóa.");

        customer.MaNguoiDungNavigation.MatKhau = request.NewPassword.Trim();
        await _context.SaveChangesAsync(ct);

        return ServiceResult.Ok("Đã đổi mật khẩu khách hàng.");
    }

    private static CustomerDetailResponse MapDetail(Models.KhachHang customer) =>
        new()
        {
            MaKhachHang = customer.MaKhachHang,
            MaNguoiDung = customer.MaNguoiDung,
            HoTen = customer.HoTen,
            SoDienThoai = customer.SoDienThoai,
            Email = customer.Email,
            DiaChi = customer.DiaChi,
            NgaySinh = customer.NgaySinh,
            DiemTichLuy = customer.DiemTichLuy,
            CoTaiKhoan = customer.MaNguoiDung != null,
            TrangThai = customer.MaNguoiDungNavigation == null || customer.MaNguoiDungNavigation.TrangThai,
            SoDonHang = customer.DonHangs?.Count ?? 0,
            NgayTao = customer.NgayTao,
            MatKhau = customer.MaNguoiDungNavigation?.MatKhau,
        };
}
