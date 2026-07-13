using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using FAB.Server.Models.DTOs.SupplierDebt;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Admin;

public class SupplierDebtAdminService : ISupplierDebtAdminService
{
    private readonly FabDbContext _context;

    public SupplierDebtAdminService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<SupplierDebtSummaryDto>> GetSummaryAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var debts = await _context.PhieuNhapKhos
            .AsNoTracking()
            .Where(x => x.TrangThai == "HoanThanh" && x.TongTien > x.SoDaTra)
            .Select(x => new { x.TongTien, x.SoDaTra, x.NgayDenHan })
            .ToListAsync(ct);

        var summary = new SupplierDebtSummaryDto
        {
            TongCongNo = debts.Sum(x => x.TongTien - x.SoDaTra),
            DaQuaHan = debts
                .Where(x => x.NgayDenHan.HasValue && x.NgayDenHan.Value < today)
                .Sum(x => x.TongTien - x.SoDaTra),
            SoPhieuChuaTra = debts.Count,
            SoNhaCungCap = await _context.NhaCungCaps.CountAsync(x => x.TrangThai, ct),
        };

        return ServiceResult<SupplierDebtSummaryDto>.Ok(summary);
    }

    public async Task<ServiceResult<PagedResult<SupplierListItemDto>>> GetSuppliersAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _context.NhaCungCaps.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x =>
                x.TenNhaCungCap.Contains(keyword) ||
                (x.SoDienThoai != null && x.SoDienThoai.Contains(keyword)) ||
                (x.Email != null && x.Email.Contains(keyword)) ||
                (x.NguoiLienHe != null && x.NguoiLienHe.Contains(keyword)));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(x => x.NgayTao)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new SupplierListItemDto
            {
                MaNhaCungCap = x.MaNhaCungCap,
                TenNhaCungCap = x.TenNhaCungCap,
                SoDienThoai = x.SoDienThoai,
                Email = x.Email,
                NguoiLienHe = x.NguoiLienHe,
                DiaChi = x.DiaChi,
                MaSoThue = x.MaSoThue,
                TrangThai = x.TrangThai,
                NgayTao = x.NgayTao,
                TongCongNo = x.PhieuNhapKhos
                    .Where(p => p.TrangThai == "HoanThanh" && p.TongTien > p.SoDaTra)
                    .Sum(p => p.TongTien - p.SoDaTra),
                SoPhieuNo = x.PhieuNhapKhos
                    .Count(p => p.TrangThai == "HoanThanh" && p.TongTien > p.SoDaTra),
            })
            .ToListAsync(ct);

        return ServiceResult<PagedResult<SupplierListItemDto>>.Ok(new PagedResult<SupplierListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        });
    }

    public async Task<ServiceResult<SupplierListItemDto>> CreateSupplierAsync(
        UpsertSupplierRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.TenNhaCungCap))
            return ServiceResult<SupplierListItemDto>.Fail("Tên nhà cung cấp không được để trống.");

        var entity = new NhaCungCap
        {
            TenNhaCungCap = request.TenNhaCungCap.Trim(),
            DiaChi = TrimOrNull(request.DiaChi),
            SoDienThoai = TrimOrNull(request.SoDienThoai),
            Email = TrimOrNull(request.Email),
            NguoiLienHe = TrimOrNull(request.NguoiLienHe),
            MaSoThue = TrimOrNull(request.MaSoThue),
            TrangThai = request.TrangThai,
            NgayTao = DateTime.Now,
        };

        _context.NhaCungCaps.Add(entity);
        await _context.SaveChangesAsync(ct);

        return ServiceResult<SupplierListItemDto>.Ok(MapSupplier(entity));
    }

    public async Task<ServiceResult<SupplierListItemDto>> UpdateSupplierAsync(
        int id, UpsertSupplierRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.TenNhaCungCap))
            return ServiceResult<SupplierListItemDto>.Fail("Tên nhà cung cấp không được để trống.");

        var entity = await _context.NhaCungCaps.FirstOrDefaultAsync(x => x.MaNhaCungCap == id, ct);
        if (entity is null)
            return ServiceResult<SupplierListItemDto>.Fail("Không tìm thấy nhà cung cấp.");

        entity.TenNhaCungCap = request.TenNhaCungCap.Trim();
        entity.DiaChi = TrimOrNull(request.DiaChi);
        entity.SoDienThoai = TrimOrNull(request.SoDienThoai);
        entity.Email = TrimOrNull(request.Email);
        entity.NguoiLienHe = TrimOrNull(request.NguoiLienHe);
        entity.MaSoThue = TrimOrNull(request.MaSoThue);
        entity.TrangThai = request.TrangThai;

        await _context.SaveChangesAsync(ct);
        return ServiceResult<SupplierListItemDto>.Ok(MapSupplier(entity));
    }

    public async Task<ServiceResult<string>> DeleteSupplierAsync(int id, CancellationToken ct = default)
    {
        var entity = await _context.NhaCungCaps
            .Include(x => x.PhieuNhapKhos)
            .FirstOrDefaultAsync(x => x.MaNhaCungCap == id, ct);

        if (entity is null)
            return ServiceResult<string>.Fail("Không tìm thấy nhà cung cấp.");

        if (entity.PhieuNhapKhos.Any())
            return ServiceResult<string>.Fail("Nhà cung cấp đã có phiếu nhập — không thể xóa.");

        _context.NhaCungCaps.Remove(entity);
        await _context.SaveChangesAsync(ct);
        return ServiceResult<string>.Ok("Đã xóa nhà cung cấp.");
    }

    public async Task<ServiceResult<PagedResult<SupplierDebtItemDto>>> GetDebtsAsync(
        int page, int pageSize, string? search = null, int? maNhaCungCap = null,
        string? trangThaiThanhToan = null, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var today = DateOnly.FromDateTime(DateTime.Today);

        var query = _context.PhieuNhapKhos
            .AsNoTracking()
            .Include(x => x.MaNhaCungCapNavigation)
            .Where(x => x.TrangThai == "HoanThanh" && x.TongTien > 0)
            .AsQueryable();

        if (maNhaCungCap.HasValue)
            query = query.Where(x => x.MaNhaCungCap == maNhaCungCap.Value);

        if (!string.IsNullOrWhiteSpace(trangThaiThanhToan))
            query = query.Where(x => x.TrangThaiThanhToan == trangThaiThanhToan);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x =>
                (x.MaNhaCungCapNavigation != null && x.MaNhaCungCapNavigation.TenNhaCungCap.Contains(keyword)) ||
                (x.GhiChu != null && x.GhiChu.Contains(keyword)) ||
                x.MaPhieuNhap.ToString().Contains(keyword));
        }

        var totalCount = await query.CountAsync(ct);

        var rows = await query
            .OrderByDescending(x => x.NgayNhap)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = rows.Select(x => MapDebt(x, today)).ToList();

        return ServiceResult<PagedResult<SupplierDebtItemDto>>.Ok(new PagedResult<SupplierDebtItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        });
    }

    public async Task<ServiceResult<SupplierDebtItemDto>> RecordPaymentAsync(
        int maPhieuNhap, RecordSupplierPaymentRequest request, CancellationToken ct = default)
    {
        if (request.SoTienTra <= 0)
            return ServiceResult<SupplierDebtItemDto>.Fail("Số tiền thanh toán phải lớn hơn 0.");

        var receipt = await _context.PhieuNhapKhos
            .Include(x => x.MaNhaCungCapNavigation)
            .FirstOrDefaultAsync(x => x.MaPhieuNhap == maPhieuNhap, ct);

        if (receipt is null)
            return ServiceResult<SupplierDebtItemDto>.Fail("Không tìm thấy phiếu nhập.");

        if (receipt.TrangThai != "HoanThanh")
            return ServiceResult<SupplierDebtItemDto>.Fail("Chỉ thanh toán phiếu nhập đã hoàn thành.");

        var conNo = receipt.TongTien - receipt.SoDaTra;
        if (conNo <= 0)
            return ServiceResult<SupplierDebtItemDto>.Fail("Phiếu này đã thanh toán đủ.");

        if (request.SoTienTra > conNo)
            return ServiceResult<SupplierDebtItemDto>.Fail($"Số tiền vượt công nợ còn lại ({conNo:N0}đ).");

        receipt.SoDaTra += request.SoTienTra;
        ApplyPaymentStatus(receipt);

        if (!string.IsNullOrWhiteSpace(request.GhiChu))
        {
            var note = request.GhiChu.Trim();
            receipt.GhiChu = string.IsNullOrWhiteSpace(receipt.GhiChu)
                ? $"TT: {note}"
                : $"{receipt.GhiChu} | TT: {note}";
        }

        await _context.SaveChangesAsync(ct);

        var today = DateOnly.FromDateTime(DateTime.Today);
        return ServiceResult<SupplierDebtItemDto>.Ok(MapDebt(receipt, today));
    }

    public async Task<ServiceResult<SupplierDebtItemDto>> AssignSupplierAsync(
        int maPhieuNhap, AssignSupplierToReceiptRequest request, CancellationToken ct = default)
    {
        var supplierExists = await _context.NhaCungCaps
            .AnyAsync(x => x.MaNhaCungCap == request.MaNhaCungCap && x.TrangThai, ct);

        if (!supplierExists)
            return ServiceResult<SupplierDebtItemDto>.Fail("Nhà cung cấp không tồn tại hoặc đã ngưng.");

        var receipt = await _context.PhieuNhapKhos
            .Include(x => x.MaNhaCungCapNavigation)
            .FirstOrDefaultAsync(x => x.MaPhieuNhap == maPhieuNhap, ct);

        if (receipt is null)
            return ServiceResult<SupplierDebtItemDto>.Fail("Không tìm thấy phiếu nhập.");

        receipt.MaNhaCungCap = request.MaNhaCungCap;
        receipt.NgayDenHan = request.NgayDenHan;

        await _context.SaveChangesAsync(ct);

        await _context.Entry(receipt).Reference(x => x.MaNhaCungCapNavigation).LoadAsync(ct);

        var today = DateOnly.FromDateTime(DateTime.Today);
        return ServiceResult<SupplierDebtItemDto>.Ok(MapDebt(receipt, today));
    }

    internal static void ApplyPaymentStatus(PhieuNhapKho receipt)
    {
        if (receipt.SoDaTra <= 0)
            receipt.TrangThaiThanhToan = "ChuaTra";
        else if (receipt.SoDaTra >= receipt.TongTien)
            receipt.TrangThaiThanhToan = "DaTra";
        else
            receipt.TrangThaiThanhToan = "TraMotPhan";
    }

    private static SupplierListItemDto MapSupplier(NhaCungCap entity) => new()
    {
        MaNhaCungCap = entity.MaNhaCungCap,
        TenNhaCungCap = entity.TenNhaCungCap,
        SoDienThoai = entity.SoDienThoai,
        Email = entity.Email,
        NguoiLienHe = entity.NguoiLienHe,
        DiaChi = entity.DiaChi,
        MaSoThue = entity.MaSoThue,
        TrangThai = entity.TrangThai,
        NgayTao = entity.NgayTao,
    };

    private static SupplierDebtItemDto MapDebt(PhieuNhapKho x, DateOnly today) => new()
    {
        MaPhieuNhap = x.MaPhieuNhap,
        MaNhaCungCap = x.MaNhaCungCap,
        TenNhaCungCap = x.MaNhaCungCapNavigation?.TenNhaCungCap,
        NgayNhap = x.NgayNhap,
        NgayDenHan = x.NgayDenHan,
        TongTien = x.TongTien,
        SoDaTra = x.SoDaTra,
        ConNo = Math.Max(0, x.TongTien - x.SoDaTra),
        TrangThaiThanhToan = x.TrangThaiThanhToan,
        TrangThaiPhieu = x.TrangThai,
        GhiChu = x.GhiChu,
        QuaHan = x.NgayDenHan.HasValue && x.NgayDenHan.Value < today && x.TongTien > x.SoDaTra,
    };

    private static string? TrimOrNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
