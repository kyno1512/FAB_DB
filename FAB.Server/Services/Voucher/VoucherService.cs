using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs.Voucher;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Voucher;

public class VoucherService : IVoucherService
{
    private readonly FabDbContext _context;

    public VoucherService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<VoucherApplyResponse>> ValidateAsync(
        string maCode, decimal subtotal, string? email, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(maCode))
            return ServiceResult<VoucherApplyResponse>.Fail("Vui lòng nhập mã khuyến mãi.");

        if (subtotal <= 0)
            return ServiceResult<VoucherApplyResponse>.Fail("Giỏ hàng trống.");

        var code = maCode.Trim().ToUpperInvariant();
        var voucher = await _context.MaGiamGia
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.MaCode == code, ct);

        if (voucher is null || !voucher.TrangThai)
            return ServiceResult<VoucherApplyResponse>.Fail("Mã khuyến mãi không hợp lệ.");

        var now = DateTime.Now;
        if (now < voucher.NgayBatDau)
            return ServiceResult<VoucherApplyResponse>.Fail("Mã khuyến mãi chưa có hiệu lực.");

        if (now > voucher.NgayKetThuc)
            return ServiceResult<VoucherApplyResponse>.Fail("Mã khuyến mãi đã hết hạn.");

        if (voucher.SoLuongToiDa.HasValue && voucher.DaDung >= voucher.SoLuongToiDa)
            return ServiceResult<VoucherApplyResponse>.Fail("Mã khuyến mãi đã hết lượt sử dụng.");

        if (subtotal < voucher.DieuKienToiThieu)
            return ServiceResult<VoucherApplyResponse>.Fail(
                $"Đơn hàng tối thiểu {voucher.DieuKienToiThieu:N0}đ để dùng mã này.");

        if (voucher.GioiHanMotEmail)
        {
            if (string.IsNullOrWhiteSpace(email))
                return ServiceResult<VoucherApplyResponse>.Fail("Vui lòng nhập email để sử dụng mã này.");

            var normalizedEmail = StringNormalizer.NormalizeEmail(email);
            var emailTag = $"EMAIL: {normalizedEmail}";

            var alreadyUsed = await _context.DonHangs.AnyAsync(
                d => d.MaVoucher == voucher.MaVoucher &&
                     d.GhiChu != null &&
                     EF.Functions.Like(d.GhiChu, $"%{emailTag}%"),
                ct);

            if (alreadyUsed)
                return ServiceResult<VoucherApplyResponse>.Fail("Email này đã sử dụng mã khuyến mãi.");
        }

        var discount = CalculateDiscount(voucher, subtotal);

        return ServiceResult<VoucherApplyResponse>.Ok(new VoucherApplyResponse
        {
            MaVoucher = voucher.MaVoucher,
            MaCode = voucher.MaCode,
            TenVoucher = voucher.TenVoucher,
            SoTienGiam = discount,
            TongThanhToan = subtotal - discount,
        });
    }

    public async Task<ServiceResult<List<VoucherListItemDto>>> GetAllAsync(CancellationToken ct = default)
    {
        var items = await _context.MaGiamGia
            .AsNoTracking()
            .OrderByDescending(v => v.MaVoucher)
            .ToListAsync(ct);

        return ServiceResult<List<VoucherListItemDto>>.Ok(items.Select(MapToDto).ToList());
    }

    public async Task<ServiceResult<VoucherListItemDto>> CreateAsync(
        CreateVoucherRequest request, CancellationToken ct = default)
    {
        var error = ValidateRequest(request);
        if (error is not null)
            return ServiceResult<VoucherListItemDto>.Fail(error);

        var code = request.MaCode.Trim().ToUpperInvariant();
        if (await _context.MaGiamGia.AnyAsync(v => v.MaCode == code, ct))
            return ServiceResult<VoucherListItemDto>.Fail("Mã khuyến mãi đã tồn tại.");

        var voucher = new MaGiamGia
        {
            TenVoucher = request.TenVoucher.Trim(),
            MaCode = code,
            LoaiGiam = NormalizeLoaiGiam(request.LoaiGiam),
            GiaTri = request.GiaTri,
            GiamToiDa = request.GiamToiDa,
            DieuKienToiThieu = request.DieuKienToiThieu,
            SoLuongToiDa = request.SoLuongToiDa,
            DaDung = 0,
            GioiHanMotEmail = request.GioiHanMotEmail,
            NgayBatDau = request.NgayBatDauParsed,
            NgayKetThuc = request.NgayKetThucParsed,
            TrangThai = request.TrangThai,
        };

        _context.MaGiamGia.Add(voucher);
        await _context.SaveChangesAsync(ct);

        return ServiceResult<VoucherListItemDto>.Ok(MapToDto(voucher));
    }

    public async Task<ServiceResult<VoucherListItemDto>> UpdateAsync(
        int maVoucher, UpdateVoucherRequest request, CancellationToken ct = default)
    {
        var error = ValidateRequest(request);
        if (error is not null)
            return ServiceResult<VoucherListItemDto>.Fail(error);

        var voucher = await _context.MaGiamGia.FirstOrDefaultAsync(v => v.MaVoucher == maVoucher, ct);
        if (voucher is null)
            return ServiceResult<VoucherListItemDto>.Fail("Không tìm thấy mã khuyến mãi.");

        var code = request.MaCode.Trim().ToUpperInvariant();
        if (await _context.MaGiamGia.AnyAsync(v => v.MaCode == code && v.MaVoucher != maVoucher, ct))
            return ServiceResult<VoucherListItemDto>.Fail("Mã khuyến mãi đã tồn tại.");

        voucher.TenVoucher = request.TenVoucher.Trim();
        voucher.MaCode = code;
        voucher.LoaiGiam = NormalizeLoaiGiam(request.LoaiGiam);
        voucher.GiaTri = request.GiaTri;
        voucher.GiamToiDa = request.GiamToiDa;
        voucher.DieuKienToiThieu = request.DieuKienToiThieu;
        voucher.SoLuongToiDa = request.SoLuongToiDa;
        voucher.GioiHanMotEmail = request.GioiHanMotEmail;
        voucher.NgayBatDau = request.NgayBatDauParsed;
        voucher.NgayKetThuc = request.NgayKetThucParsed;
        voucher.TrangThai = request.TrangThai;

        await _context.SaveChangesAsync(ct);
        return ServiceResult<VoucherListItemDto>.Ok(MapToDto(voucher));
    }

    public async Task<ServiceResult> DeleteAsync(int maVoucher, CancellationToken ct = default)
    {
        var voucher = await _context.MaGiamGia
            .Include(v => v.DonHangs)
            .FirstOrDefaultAsync(v => v.MaVoucher == maVoucher, ct);

        if (voucher is null)
            return ServiceResult.Fail("Không tìm thấy mã khuyến mãi.");

        if (voucher.DonHangs.Count > 0)
            return ServiceResult.Fail("Không thể xóa mã đã có đơn hàng sử dụng.");

        _context.MaGiamGia.Remove(voucher);
        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok("Đã xóa mã khuyến mãi.");
    }

    public async Task<ServiceResult> MarkUsedAsync(int maVoucher, CancellationToken ct = default)
    {
        var voucher = await _context.MaGiamGia.FirstOrDefaultAsync(v => v.MaVoucher == maVoucher, ct);
        if (voucher is null)
            return ServiceResult.Fail("Không tìm thấy mã khuyến mãi.");

        voucher.DaDung += 1;
        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok("OK");
    }

    internal static decimal CalculateDiscount(MaGiamGia voucher, decimal subtotal)
    {
        decimal discount = string.Equals(voucher.LoaiGiam, "SoTien", StringComparison.OrdinalIgnoreCase)
            ? voucher.GiaTri
            : Math.Round(subtotal * voucher.GiaTri / 100m, 0, MidpointRounding.AwayFromZero);

        if (voucher.GiamToiDa.HasValue && discount > voucher.GiamToiDa.Value)
            discount = voucher.GiamToiDa.Value;

        if (discount > subtotal)
            discount = subtotal;

        if (discount < 0)
            discount = 0;

        return discount;
    }

    private static string? ValidateRequest(CreateVoucherRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TenVoucher))
            return "Vui lòng nhập tên chương trình.";

        if (string.IsNullOrWhiteSpace(request.MaCode))
            return "Vui lòng nhập mã khuyến mãi.";

        if (request.GiaTri <= 0)
            return "Giá trị khuyến mãi phải lớn hơn 0.";

        if (string.Equals(NormalizeLoaiGiam(request.LoaiGiam), "PhanTram", StringComparison.Ordinal) &&
            request.GiaTri > 100)
            return "Phần trăm giảm không được vượt quá 100.";

        if (request.NgayKetThuc <= request.NgayBatDau)
            return "Ngày kết thúc phải sau ngày bắt đầu.";

        return null;
    }

    private static string NormalizeLoaiGiam(string loai) =>
        string.Equals(loai, "SoTien", StringComparison.OrdinalIgnoreCase) ? "SoTien" : "PhanTram";

    private static VoucherListItemDto MapToDto(MaGiamGia v) => new()
    {
        MaVoucher = v.MaVoucher,
        TenVoucher = v.TenVoucher,
        MaCode = v.MaCode,
        LoaiGiam = v.LoaiGiam,
        GiaTri = v.GiaTri,
        GiamToiDa = v.GiamToiDa,
        DieuKienToiThieu = v.DieuKienToiThieu,
        SoLuongToiDa = v.SoLuongToiDa,
        DaDung = v.DaDung,
        GioiHanMotEmail = v.GioiHanMotEmail,
        NgayBatDau = v.NgayBatDau,
        NgayKetThuc = v.NgayKetThuc,
        TrangThai = v.TrangThai,
    };
}
