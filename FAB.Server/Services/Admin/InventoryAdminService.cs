using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs.Inventory;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Admin;

public class InventoryAdminService : IInventoryAdminService
{
    private readonly FabDbContext _context;

    public InventoryAdminService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<List<InventoryItemDto>>> GetAllAsync(string? search = null, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var warningDate = today.AddDays(7);

        var query = _context.NguyenLieus.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x =>
                x.TenNguyenLieu.Contains(keyword) ||
                (x.MoTa != null && x.MoTa.Contains(keyword)));
        }

        var raw = await query
            .OrderBy(x => x.TenNguyenLieu)
            .Select(x => new
            {
                x.MaNguyenLieu,
                x.TenNguyenLieu,
                x.DonVi,
                x.SoLuongTon,
                x.MucTonToiThieu,
                x.GiaNhap,
                x.MoTa,
                x.TrangThai,
                // Lấy HSD của lô còn hàng (soLuongCon > 0) và còn hạn sử dụng, gần nhất
                HanSuDungGanNhat = x.Los
                    .Where(l => l.SoLuongCon > 0 && l.HanSuDung >= today)
                    .OrderBy(l => l.HanSuDung)
                    .Select(l => (DateOnly?)l.HanSuDung)
                    .FirstOrDefault(),
                TongSoLo = x.Los.Count,
                SoLoSapHetHan = x.Los.Count(l => l.SoLuongCon > 0 && l.HanSuDung <= warningDate && l.HanSuDung >= today),
                SoLoDaHetHan = x.Los.Count(l => l.SoLuongCon > 0 && l.HanSuDung < today),
            })
            .ToListAsync(ct);

        var items = raw.Select(x => new InventoryItemDto
        {
            MaNguyenLieu = x.MaNguyenLieu,
            TenNguyenLieu = x.TenNguyenLieu,
            DonVi = x.DonVi,
            SoLuongTon = x.SoLuongTon,
            MucTonToiThieu = x.MucTonToiThieu,
            GiaNhap = x.GiaNhap,
            MoTa = x.MoTa,
            TrangThai = x.TrangThai,
            TrangThaiTon = ResolveStockStatus(x.SoLuongTon, x.MucTonToiThieu),
            HanSuDungTu = x.HanSuDungGanNhat,
            HanSuDungDen = x.HanSuDungGanNhat,
            SoNgayConLai = ResolveDaysLeft(x.HanSuDungGanNhat),
            TrangThaiHSD = ResolveItemExpiryStatus(x.HanSuDungGanNhat),
            TongSoLo = x.TongSoLo,
            SoLoSapHetHan = x.SoLoSapHetHan,
            SoLoDaHetHan = x.SoLoDaHetHan,
        }).ToList();

        return ServiceResult<List<InventoryItemDto>>.Ok(items);
    }

    public async Task<ServiceResult<List<InventoryItemDto>>> GetAllForSelectAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var items = await _context.NguyenLieus
            .AsNoTracking()
            .OrderBy(x => x.TenNguyenLieu)
            .Select(x => new
            {
                x.MaNguyenLieu,
                x.TenNguyenLieu,
                x.DonVi,
                x.SoLuongTon,
                x.MucTonToiThieu,
                x.GiaNhap,
                x.MoTa,
                x.TrangThai,
                HanSuDungGanNhat = x.Los.Where(l => l.TrangThai == "ConHang").OrderBy(l => l.HanSuDung).Select(l => (DateOnly?)l.HanSuDung).FirstOrDefault(),
            })
            .ToListAsync(ct);

        return ServiceResult<List<InventoryItemDto>>.Ok(items.Select(x => new InventoryItemDto
        {
            MaNguyenLieu = x.MaNguyenLieu,
            TenNguyenLieu = x.TenNguyenLieu,
            DonVi = x.DonVi,
            SoLuongTon = x.SoLuongTon,
            MucTonToiThieu = x.MucTonToiThieu,
            GiaNhap = x.GiaNhap,
            MoTa = x.MoTa,
            TrangThai = x.TrangThai,
            TrangThaiTon = ResolveStockStatus(x.SoLuongTon, x.MucTonToiThieu),
            HanSuDungTu = x.HanSuDungGanNhat,
            HanSuDungDen = x.HanSuDungGanNhat,
            SoNgayConLai = ResolveDaysLeft(x.HanSuDungGanNhat),
            TrangThaiHSD = ResolveItemExpiryStatus(x.HanSuDungGanNhat),
        }).ToList());
    }

    public async Task<ServiceResult<InventoryItemListDto>> GetListAsync(
        string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var safePage = Math.Max(1, page);
        var safePageSize = Math.Clamp(pageSize, 5, 100);
        var today = DateOnly.FromDateTime(DateTime.Now);
        var warningDate = today.AddDays(7);

        var query = _context.NguyenLieus.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x =>
                x.TenNguyenLieu.Contains(keyword) ||
                (x.MoTa != null && x.MoTa.Contains(keyword)));
        }

        var totalCount = await query.CountAsync(ct);

        var raw = await query
            .OrderBy(x => x.TenNguyenLieu)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .Select(x => new
            {
                x.MaNguyenLieu,
                x.TenNguyenLieu,
                x.DonVi,
                x.SoLuongTon,
                x.MucTonToiThieu,
                x.GiaNhap,
                x.MoTa,
                x.TrangThai,
                HanSuDungGanNhat = x.Los.Where(l => l.TrangThai == "ConHang").OrderBy(l => l.HanSuDung).Select(l => (DateOnly?)l.HanSuDung).FirstOrDefault(),
                TongSoLo = x.Los.Count,
                SoLoSapHetHan = x.Los.Count(l => l.TrangThai == "ConHang" && l.HanSuDung <= warningDate),
            })
            .ToListAsync(ct);

        var items = raw.Select(x => new InventoryItemDto
        {
            MaNguyenLieu = x.MaNguyenLieu,
            TenNguyenLieu = x.TenNguyenLieu,
            DonVi = x.DonVi,
            SoLuongTon = x.SoLuongTon,
            MucTonToiThieu = x.MucTonToiThieu,
            GiaNhap = x.GiaNhap,
            MoTa = x.MoTa,
            TrangThai = x.TrangThai,
            TrangThaiTon = ResolveStockStatus(x.SoLuongTon, x.MucTonToiThieu),
            HanSuDungTu = x.HanSuDungGanNhat,
            HanSuDungDen = x.HanSuDungGanNhat,
            SoNgayConLai = ResolveDaysLeft(x.HanSuDungGanNhat),
            TrangThaiHSD = ResolveItemExpiryStatus(x.HanSuDungGanNhat),
            TongSoLo = x.TongSoLo,
            SoLoSapHetHan = x.SoLoSapHetHan,
        }).ToList();

        return ServiceResult<InventoryItemListDto>.Ok(new InventoryItemListDto
        {
            Items = items,
            TotalCount = totalCount,
        });
    }

    public async Task<ServiceResult<InventoryItemDto>> CreateAsync(CreateInventoryRequest request, CancellationToken ct = default)
    {
        var name = request.TenNguyenLieu?.Trim();
        if (string.IsNullOrWhiteSpace(name))
            return ServiceResult<InventoryItemDto>.Fail("Tên nguyên liệu không được để trống.");

        if (string.IsNullOrWhiteSpace(request.DonVi))
            return ServiceResult<InventoryItemDto>.Fail("Đơn vị không được để trống.");

        var item = new NguyenLieu
        {
            TenNguyenLieu = name,
            DonVi = request.DonVi.Trim(),
            SoLuongTon = Math.Max(0, request.SoLuongTon),
            MucTonToiThieu = Math.Max(0, request.MucTonToiThieu),
            GiaNhap = request.GiaNhap,
            MoTa = request.MoTa?.Trim(),
            TrangThai = true,
            HanSuDungTu = request.HanSuDungTu,
            HanSuDungDen = request.HanSuDungDen,
        };

        _context.NguyenLieus.Add(item);
        await _context.SaveChangesAsync(ct);

        return ServiceResult<InventoryItemDto>.Ok(MapItem(item));
    }

    public async Task<ServiceResult<InventoryItemDto>> UpdateAsync(int id, UpdateInventoryRequest request, CancellationToken ct = default)
    {
        var item = await _context.NguyenLieus.FirstOrDefaultAsync(x => x.MaNguyenLieu == id, ct);
        if (item is null)
            return ServiceResult<InventoryItemDto>.Fail("Không tìm thấy nguyên liệu.");

        var name = request.TenNguyenLieu?.Trim();
        if (string.IsNullOrWhiteSpace(name))
            return ServiceResult<InventoryItemDto>.Fail("Tên nguyên liệu không được để trống.");

        if (string.IsNullOrWhiteSpace(request.DonVi))
            return ServiceResult<InventoryItemDto>.Fail("Đơn vị không được để trống.");

        item.TenNguyenLieu = name;
        item.DonVi = request.DonVi.Trim();
        item.SoLuongTon = Math.Max(0, request.SoLuongTon);
        item.MucTonToiThieu = Math.Max(0, request.MucTonToiThieu);
        item.GiaNhap = request.GiaNhap;
        item.MoTa = request.MoTa?.Trim();
        item.TrangThai = request.TrangThai;
        item.HanSuDungTu = request.HanSuDungTu;
        item.HanSuDungDen = request.HanSuDungDen;

        await _context.SaveChangesAsync(ct);
        return ServiceResult<InventoryItemDto>.Ok(MapItem(item));
    }

    public async Task<ServiceResult<InventoryItemDto>> AdjustStockAsync(
        int id, AdjustInventoryRequest request, int? nguoiThucHien, CancellationToken ct = default)
    {
        if (request.SoLuongThayDoi == 0)
            return ServiceResult<InventoryItemDto>.Fail("Số lượng điều chỉnh phải khác 0.");

        var item = await _context.NguyenLieus.FirstOrDefaultAsync(x => x.MaNguyenLieu == id, ct);
        if (item is null)
            return ServiceResult<InventoryItemDto>.Fail("Không tìm thấy nguyên liệu.");

        var before = item.SoLuongTon;
        var after = before + request.SoLuongThayDoi;
        if (after < 0)
            return ServiceResult<InventoryItemDto>.Fail("Tồn kho không đủ để xuất.");

        item.SoLuongTon = after;

        _context.LichSuTonKhos.Add(new LichSuTonKho
        {
            MaNguyenLieu = item.MaNguyenLieu,
            LoaiThayDoi = request.SoLuongThayDoi > 0 ? "Nhap" : "Xuat",
            SoLuongThayDoi = request.SoLuongThayDoi,
            SoLuongTruoc = before,
            SoLuongSau = after,
            GhiChu = request.GhiChu?.Trim(),
            NguoiThucHien = nguoiThucHien,
            NgayGhiNhan = DateTime.Now,
        });

        await _context.SaveChangesAsync(ct);
        return ServiceResult<InventoryItemDto>.Ok(MapItem(item));
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default)
    {
        var item = await _context.NguyenLieus.FirstOrDefaultAsync(x => x.MaNguyenLieu == id, ct);
        if (item is null)
            return ServiceResult.Fail("Không tìm thấy nguyên liệu.");

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            _context.AiduBaoTonKhos.RemoveRange(
                await _context.AiduBaoTonKhos.Where(x => x.MaNguyenLieu == id).ToListAsync(ct));
            _context.ChiTietDonDatHangNhaps.RemoveRange(
                await _context.ChiTietDonDatHangNhaps.Where(x => x.MaNguyenLieu == id).ToListAsync(ct));
            _context.ChiTietPhieuNhapKhos.RemoveRange(
                await _context.ChiTietPhieuNhapKhos.Where(x => x.MaNguyenLieu == id).ToListAsync(ct));
            _context.ChiTietPhieuXuatKhos.RemoveRange(
                await _context.ChiTietPhieuXuatKhos.Where(x => x.MaNguyenLieu == id).ToListAsync(ct));
            _context.CongThucSanPhams.RemoveRange(
                await _context.CongThucSanPhams.Where(x => x.MaNguyenLieu == id).ToListAsync(ct));
            _context.LichSuTonKhos.RemoveRange(
                await _context.LichSuTonKhos.Where(x => x.MaNguyenLieu == id).ToListAsync(ct));
            _context.NguyenLieuNccs.RemoveRange(
                await _context.NguyenLieuNccs.Where(x => x.MaNguyenLieu == id).ToListAsync(ct));

            _context.NguyenLieus.Remove(item);
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return ServiceResult.Ok("Đã xóa nguyên liệu và toàn bộ dữ liệu liên quan.");
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<ServiceResult<List<InventoryHistoryItemDto>>> GetHistoryAsync(int id, CancellationToken ct = default)
    {
        var exists = await _context.NguyenLieus.AsNoTracking().AnyAsync(x => x.MaNguyenLieu == id, ct);
        if (!exists)
            return ServiceResult<List<InventoryHistoryItemDto>>.Fail("Không tìm thấy nguyên liệu.");

        var history = await _context.LichSuTonKhos
            .AsNoTracking()
            .Include(x => x.NguoiThucHienNavigation)
            .Where(x => x.MaNguyenLieu == id)
            .OrderByDescending(x => x.NgayGhiNhan)
            .Take(20)
            .Select(x => new InventoryHistoryItemDto
            {
                MaLichSu = x.MaLichSu,
                MaNguyenLieu = x.MaNguyenLieu,
                TenNguyenLieu = x.MaNguyenLieuNavigation.TenNguyenLieu,
                DonVi = x.MaNguyenLieuNavigation.DonVi,
                LoaiThayDoi = x.LoaiThayDoi,
                SoLuongThayDoi = x.SoLuongThayDoi,
                SoLuongTruoc = x.SoLuongTruoc,
                SoLuongSau = x.SoLuongSau,
                GhiChu = x.GhiChu,
                NguoiThucHien = x.NguoiThucHienNavigation != null ? x.NguoiThucHienNavigation.HoTen : null,
                NgayGhiNhan = x.NgayGhiNhan,
            })
            .ToListAsync(ct);

        return ServiceResult<List<InventoryHistoryItemDto>>.Ok(history);
    }

    public async Task<ServiceResult<List<InventoryHistoryItemDto>>> GetRecentMovementsAsync(
        int limit = 100,
        DateTime? from = null,
        DateTime? to = null,
        string? search = null,
        string? loai = null,
        CancellationToken ct = default)
    {
        var safeLimit = Math.Clamp(limit, 1, 500);
        var query = _context.LichSuTonKhos
            .AsNoTracking()
            .Include(x => x.MaNguyenLieuNavigation)
            .Include(x => x.NguoiThucHienNavigation)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(x => x.NgayGhiNhan >= from.Value);

        if (to.HasValue)
            query = query.Where(x => x.NgayGhiNhan <= to.Value);

        if (!string.IsNullOrWhiteSpace(loai) && loai is "Nhap" or "Xuat")
            query = query.Where(x => x.LoaiThayDoi == loai);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x =>
                x.MaNguyenLieuNavigation.TenNguyenLieu.Contains(keyword) ||
                (x.GhiChu != null && x.GhiChu.Contains(keyword)) ||
                (x.NguoiThucHienNavigation != null && x.NguoiThucHienNavigation.HoTen.Contains(keyword)));
        }

        var history = await query
            .OrderByDescending(x => x.NgayGhiNhan)
            .Take(safeLimit)
            .Select(x => new InventoryHistoryItemDto
            {
                MaLichSu = x.MaLichSu,
                MaNguyenLieu = x.MaNguyenLieu,
                TenNguyenLieu = x.MaNguyenLieuNavigation.TenNguyenLieu,
                DonVi = x.MaNguyenLieuNavigation.DonVi,
                LoaiThayDoi = x.LoaiThayDoi,
                SoLuongThayDoi = x.SoLuongThayDoi,
                SoLuongTruoc = x.SoLuongTruoc,
                SoLuongSau = x.SoLuongSau,
                GhiChu = x.GhiChu,
                NguoiThucHien = x.NguoiThucHienNavigation != null ? x.NguoiThucHienNavigation.HoTen : null,
                NgayGhiNhan = x.NgayGhiNhan,
            })
            .ToListAsync(ct);

        return ServiceResult<List<InventoryHistoryItemDto>>.Ok(history);
    }

    public async Task<ServiceResult<int>> DeleteMovementsAsync(IReadOnlyList<int> ids, CancellationToken ct = default)
    {
        if (ids.Count == 0)
            return ServiceResult<int>.Fail("Chưa chọn bản ghi để xóa.");

        var records = await _context.LichSuTonKhos
            .Include(x => x.MaNguyenLieuNavigation)
            .Where(x => ids.Contains(x.MaLichSu))
            .ToListAsync(ct);

        if (records.Count != ids.Count)
            return ServiceResult<int>.Fail("Một số bản ghi không tồn tại hoặc đã bị xóa.");

        var revertByMaterial = records
            .GroupBy(x => x.MaNguyenLieu)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.SoLuongThayDoi));

        foreach (var (maNguyenLieu, delta) in revertByMaterial)
        {
            var item = records.First(x => x.MaNguyenLieu == maNguyenLieu).MaNguyenLieuNavigation;
            var nextStock = item.SoLuongTon - delta;
            if (nextStock < 0)
            {
                return ServiceResult<int>.Fail(
                    $"Không thể xóa: tồn kho {item.TenNguyenLieu} sẽ âm sau khi hoàn tác.");
            }

            item.SoLuongTon = nextStock;
        }

        _context.LichSuTonKhos.RemoveRange(records);
        await _context.SaveChangesAsync(ct);
        return ServiceResult<int>.Ok(records.Count);
    }

    public async Task<ServiceResult<List<ImportReceiptListItemDto>>> GetImportReceiptsAsync(
        int limit = 100, CancellationToken ct = default)
    {
        var safeLimit = Math.Clamp(limit, 1, 200);
        var receipts = await _context.PhieuNhapKhos
            .AsNoTracking()
            .Include(x => x.MaNhaCungCapNavigation)
            .Include(x => x.ChiTietPhieuNhapKhos)
                .ThenInclude(x => x.MaNguyenLieuNavigation)
            .OrderByDescending(x => x.NgayNhap)
            .Take(safeLimit)
            .ToListAsync(ct);

        return ServiceResult<List<ImportReceiptListItemDto>>.Ok(receipts.Select(MapImportReceipt).ToList());
    }

    public async Task<ServiceResult<List<ExportReceiptListItemDto>>> GetExportReceiptsAsync(
        int limit = 100, CancellationToken ct = default)
    {
        var safeLimit = Math.Clamp(limit, 1, 200);
        var receipts = await _context.PhieuXuatKhos
            .AsNoTracking()
            .Include(x => x.ChiTietPhieuXuatKhos)
                .ThenInclude(x => x.MaNguyenLieuNavigation)
            .OrderByDescending(x => x.NgayXuat)
            .Take(safeLimit)
            .ToListAsync(ct);

        return ServiceResult<List<ExportReceiptListItemDto>>.Ok(receipts.Select(MapExportReceipt).ToList());
    }

    public async Task<ServiceResult<ImportReceiptListItemDto>> CreateImportReceiptAsync(
        CreateImportReceiptRequest request, int nguoiTao, CancellationToken ct = default)
    {
        var lines = request.Lines?
            .Where(x => x.MaNguyenLieu > 0 && x.SoLuong > 0)
            .ToList() ?? [];

        if (lines.Count == 0)
            return ServiceResult<ImportReceiptListItemDto>.Fail("Phiếu nhập cần ít nhất một dòng hợp lệ.");

        var materialIds = lines.Select(x => x.MaNguyenLieu).Distinct().ToList();
        var materials = await _context.NguyenLieus
            .Where(x => materialIds.Contains(x.MaNguyenLieu))
            .ToDictionaryAsync(x => x.MaNguyenLieu, ct);

        if (materials.Count != materialIds.Count)
            return ServiceResult<ImportReceiptListItemDto>.Fail("Có nguyên liệu không tồn tại.");

        var receipt = new PhieuNhapKho
        {
            MaNguoiTao = nguoiTao,
            MaNhaCungCap = request.MaNhaCungCap,
            NgayNhap = DateTime.Now,
            GhiChu = request.GhiChu?.Trim(),
            TrangThai = "HoanThanh",
            TongTien = 0,
        };

        foreach (var line in lines)
        {
            var thanhTien = line.SoLuong * line.DonGia;
            receipt.TongTien += thanhTien;
            receipt.ChiTietPhieuNhapKhos.Add(new ChiTietPhieuNhapKho
            {
                MaNguyenLieu = line.MaNguyenLieu,
                SoLuong = line.SoLuong,
                DonGia = line.DonGia,
                ThanhTien = thanhTien,
            });
        }

        _context.PhieuNhapKhos.Add(receipt);
        await _context.SaveChangesAsync(ct);

        foreach (var line in lines)
        {
            var item = materials[line.MaNguyenLieu];
            var before = item.SoLuongTon;
            item.SoLuongTon = before + line.SoLuong;

            _context.LichSuTonKhos.Add(new LichSuTonKho
            {
                MaNguyenLieu = item.MaNguyenLieu,
                LoaiThayDoi = "Nhap",
                SoLuongThayDoi = line.SoLuong,
                SoLuongTruoc = before,
                SoLuongSau = item.SoLuongTon,
                GhiChu = request.GhiChu?.Trim() ?? $"Phiếu nhập #{receipt.MaPhieuNhap}",
                NguoiThucHien = nguoiTao,
                NgayGhiNhan = DateTime.Now,
            });
        }

        await _context.SaveChangesAsync(ct);

        var created = await _context.PhieuNhapKhos
            .AsNoTracking()
            .Include(x => x.MaNhaCungCapNavigation)
            .Include(x => x.ChiTietPhieuNhapKhos)
                .ThenInclude(x => x.MaNguyenLieuNavigation)
            .FirstAsync(x => x.MaPhieuNhap == receipt.MaPhieuNhap, ct);

        return ServiceResult<ImportReceiptListItemDto>.Ok(MapImportReceipt(created));
    }

    public async Task<ServiceResult<ExportReceiptListItemDto>> CreateExportReceiptAsync(
        CreateExportReceiptRequest request, int nguoiTao, CancellationToken ct = default)
    {
        var lines = request.Lines?
            .Where(x => x.MaNguyenLieu > 0 && x.SoLuong > 0)
            .ToList() ?? [];

        if (lines.Count == 0)
            return ServiceResult<ExportReceiptListItemDto>.Fail("Phiếu xuất cần ít nhất một dòng hợp lệ.");

        var materialIds = lines.Select(x => x.MaNguyenLieu).Distinct().ToList();
        var materials = await _context.NguyenLieus
            .Where(x => materialIds.Contains(x.MaNguyenLieu))
            .ToDictionaryAsync(x => x.MaNguyenLieu, ct);

        if (materials.Count != materialIds.Count)
            return ServiceResult<ExportReceiptListItemDto>.Fail("Có nguyên liệu không tồn tại.");

        foreach (var line in lines)
        {
            if (materials[line.MaNguyenLieu].SoLuongTon < line.SoLuong)
                return ServiceResult<ExportReceiptListItemDto>.Fail(
                    $"Tồn kho không đủ cho {materials[line.MaNguyenLieu].TenNguyenLieu}.");
        }

        var receipt = new PhieuXuatKho
        {
            MaNguoiTao = nguoiTao,
            LyDoXuat = request.LyDoXuat?.Trim() ?? "Xuất kho",
            NgayXuat = DateTime.Now,
            GhiChu = request.GhiChu?.Trim(),
            TrangThai = "HoanThanh",
        };

        foreach (var line in lines)
        {
            receipt.ChiTietPhieuXuatKhos.Add(new ChiTietPhieuXuatKho
            {
                MaNguyenLieu = line.MaNguyenLieu,
                SoLuong = line.SoLuong,
                GhiChu = line.GhiChu?.Trim(),
            });
        }

        _context.PhieuXuatKhos.Add(receipt);
        await _context.SaveChangesAsync(ct);

        foreach (var line in lines)
        {
            var item = materials[line.MaNguyenLieu];
            var before = item.SoLuongTon;
            item.SoLuongTon = before - line.SoLuong;

            _context.LichSuTonKhos.Add(new LichSuTonKho
            {
                MaNguyenLieu = item.MaNguyenLieu,
                LoaiThayDoi = "Xuat",
                SoLuongThayDoi = -line.SoLuong,
                SoLuongTruoc = before,
                SoLuongSau = item.SoLuongTon,
                GhiChu = request.GhiChu?.Trim() ?? $"Phiếu xuất #{receipt.MaPhieuXuat}",
                NguoiThucHien = nguoiTao,
                NgayGhiNhan = DateTime.Now,
            });
        }

        await _context.SaveChangesAsync(ct);

        var created = await _context.PhieuXuatKhos
            .AsNoTracking()
            .Include(x => x.ChiTietPhieuXuatKhos)
                .ThenInclude(x => x.MaNguyenLieuNavigation)
            .FirstAsync(x => x.MaPhieuXuat == receipt.MaPhieuXuat, ct);

        return ServiceResult<ExportReceiptListItemDto>.Ok(MapExportReceipt(created));
    }

    private static ImportReceiptListItemDto MapImportReceipt(PhieuNhapKho receipt) => new()
    {
        MaPhieuNhap = receipt.MaPhieuNhap,
        NgayNhap = receipt.NgayNhap,
        TongTien = receipt.TongTien,
        TrangThai = receipt.TrangThai,
        GhiChu = receipt.GhiChu,
        TenNhaCungCap = receipt.MaNhaCungCapNavigation?.TenNhaCungCap,
        SoDong = receipt.ChiTietPhieuNhapKhos.Count,
        ChiTiet = receipt.ChiTietPhieuNhapKhos.Select(x => new ImportReceiptLineDto
        {
            MaChiTiet = x.MaChiTiet,
            MaNguyenLieu = x.MaNguyenLieu,
            TenNguyenLieu = x.MaNguyenLieuNavigation.TenNguyenLieu,
            DonVi = x.MaNguyenLieuNavigation.DonVi,
            SoLuong = x.SoLuong,
            DonGia = x.DonGia,
            ThanhTien = x.ThanhTien ?? x.SoLuong * x.DonGia,
            HanSuDungTu = x.MaLoNavigation?.NgaySanXuat,
            HanSuDungDen = x.MaLoNavigation?.HanSuDung,
        }).ToList(),
    };

    private static ExportReceiptListItemDto MapExportReceipt(PhieuXuatKho receipt) => new()
    {
        MaPhieuXuat = receipt.MaPhieuXuat,
        NgayXuat = receipt.NgayXuat,
        LyDoXuat = receipt.LyDoXuat,
        TrangThai = receipt.TrangThai,
        GhiChu = receipt.GhiChu,
        SoDong = receipt.ChiTietPhieuXuatKhos.Count,
        ChiTiet = receipt.ChiTietPhieuXuatKhos.Select(x => new ExportReceiptLineDto
        {
            MaChiTiet = x.MaChiTiet,
            MaNguyenLieu = x.MaNguyenLieu,
            TenNguyenLieu = x.MaNguyenLieuNavigation.TenNguyenLieu,
            DonVi = x.MaNguyenLieuNavigation.DonVi,
            SoLuong = x.SoLuong,
            GhiChu = x.GhiChu,
        }).ToList(),
    };

    private static InventoryItemDto MapItem(NguyenLieu item) => new()
    {
        MaNguyenLieu = item.MaNguyenLieu,
        TenNguyenLieu = item.TenNguyenLieu,
        DonVi = item.DonVi,
        SoLuongTon = item.SoLuongTon,
        MucTonToiThieu = item.MucTonToiThieu,
        GiaNhap = item.GiaNhap,
        MoTa = item.MoTa,
        TrangThai = item.TrangThai,
        TrangThaiTon = ResolveStockStatus(item.SoLuongTon, item.MucTonToiThieu),
        HanSuDungTu = item.HanSuDungTu,
        HanSuDungDen = item.HanSuDungDen,
        SoNgayConLai = ResolveDaysLeft(item.HanSuDungTu),
        TrangThaiHSD = ResolveItemExpiryStatus(item.HanSuDungTu),
    };

    private static string ResolveStockStatus(decimal ton, decimal min) =>
        ton <= 0 ? "HetHang" : ton < min ? "ThieuHang" : ton == min ? "SapHet" : "DuHang";

    private static int? ResolveDaysLeft(DateOnly? hanSuDung)
    {
        if (!hanSuDung.HasValue) return null;
        var today = DateOnly.FromDateTime(DateTime.Now);
        return hanSuDung.Value.DayNumber - today.DayNumber;
    }

    private static string? ResolveItemExpiryStatus(DateOnly? hanSuDung)
    {
        if (!hanSuDung.HasValue) return null;
        var today = DateOnly.FromDateTime(DateTime.Now);
        var warningDate = today.AddDays(7);
        if (hanSuDung.Value <= today) return "DaHetHan";
        if (hanSuDung.Value <= warningDate) return "SapHetHan";
        return "ConHan";
    }

    public async Task<ServiceResult<List<InventoryBatchDetailDto>>> GetBatchesByMaterialAsync(int maNguyenLieu, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var warningDate = today.AddDays(7);

        var batches = await _context.Los
            .AsNoTracking()
            .Include(x => x.MaNguyenLieuNavigation)
            .Where(x => x.MaNguyenLieu == maNguyenLieu)
            .OrderByDescending(x => x.NgayTao)
            .Select(x => new InventoryBatchDetailDto
            {
                MaPhieuNhap = x.MaLo,
                NgayNhap = x.NgayTao,
                MaChiTiet = x.MaLo,
                TenNhaCungCap = x.GhiChu,
                SoLuong = x.SoLuongCon,
                DonGia = x.DonGia ?? 0,
                HanSuDungTu = x.NgaySanXuat,
                HanSuDungDen = x.HanSuDung,
                SoNgayConLai = x.HanSuDung.DayNumber - today.DayNumber,
                TrangThaiHSD = x.HanSuDung <= today ? "DaHetHan" : (x.HanSuDung <= warningDate ? "SapHetHan" : "ConHan"),
            })
            .ToListAsync(ct);

        return ServiceResult<List<InventoryBatchDetailDto>>.Ok(batches);
    }

    public async Task<ServiceResult<List<MaterialRecipeDto>>> GetRecipesByMaterialAsync(int maNguyenLieu, CancellationToken ct = default)
    {
        var items = await _context.CongThucSanPhams
            .AsNoTracking()
            .Include(x => x.MaSanPhamNavigation)
            .Where(x => x.MaNguyenLieu == maNguyenLieu)
            .OrderByDescending(x => x.MaCongThuc)
            .Select(x => new MaterialRecipeDto
            {
                MaCongThuc = x.MaCongThuc,
                MaSanPham = x.MaSanPham,
                TenSanPham = x.MaSanPhamNavigation.TenSanPham,
                MaNguyenLieu = x.MaNguyenLieu,
                TenNguyenLieu = x.MaNguyenLieuNavigation.TenNguyenLieu,
                SoLuong = x.SoLuong,
                DonVi = x.DonVi,
                GhiChu = x.GhiChu,
                SoLuongTon = x.MaNguyenLieuNavigation.SoLuongTon,
            })
            .ToListAsync(ct);

        return ServiceResult<List<MaterialRecipeDto>>.Ok(items);
    }

    private static string? ResolveBatchExpiryStatus(DateOnly? tu, DateOnly? den, DateOnly today, DateOnly warningDate)
    {
        if (!tu.HasValue || !den.HasValue) return null;
        if (den.Value < today) return "DaHetHan";
        if (den.Value <= warningDate) return "SapHetHan";
        return "ConHan";
    }

    // ==================== QUẢN LÝ LÔ ====================

    public async Task<ServiceResult<List<LoDto>>> GetLosByMaterialAsync(int maNguyenLieu, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var warningDate = today.AddDays(7);

        var los = await _context.Los
            .AsNoTracking()
            .Include(x => x.MaNguyenLieuNavigation)
            .Where(x => x.MaNguyenLieu == maNguyenLieu)
            .OrderByDescending(x => x.TrangThai == "ConHang")
            .ThenBy(x => x.HanSuDung)
            .ToListAsync(ct);

        var result = los.Select(x => new LoDto
        {
            MaLo = x.MaLo,
            MaNguyenLieu = x.MaNguyenLieu,
            TenNguyenLieu = x.MaNguyenLieuNavigation.TenNguyenLieu,
            DonVi = x.MaNguyenLieuNavigation.DonVi,
            NgaySanXuat = x.NgaySanXuat,
            HanSuDung = x.HanSuDung,
            SoLuong = x.SoLuong,
            SoLuongCon = x.SoLuongCon,
            DonGia = x.DonGia,
            NgayTao = x.NgayTao,
            GhiChu = x.GhiChu,
            TrangThai = x.TrangThai,
            SoNgayConLai = x.HanSuDung.DayNumber - today.DayNumber,
            TinhTrang = ResolveLoTinhTrang(x, today, warningDate, x.MaNguyenLieuNavigation.MucTonToiThieu),
        }).ToList();

        return ServiceResult<List<LoDto>>.Ok(result);
    }

    public async Task<ServiceResult<LoDto>> CreateLoAsync(CreateLoRequest request, CancellationToken ct = default)
    {
        var material = await _context.NguyenLieus.FirstOrDefaultAsync(x => x.MaNguyenLieu == request.MaNguyenLieu, ct);
        if (material == null)
            return ServiceResult<LoDto>.Fail("Không tìm thấy nguyên liệu.");

        if (request.SoLuong <= 0)
            return ServiceResult<LoDto>.Fail("Số lượng phải lớn hơn 0.");

        if (request.HanSuDung < DateOnly.FromDateTime(DateTime.Now))
            return ServiceResult<LoDto>.Fail("Hạn sử dụng không được nhỏ hơn ngày hiện tại.");

        var lo = new Lo
        {
            MaNguyenLieu = request.MaNguyenLieu,
            NgaySanXuat = request.NgaySanXuat,
            HanSuDung = request.HanSuDung,
            SoLuong = request.SoLuong,
            SoLuongCon = request.SoLuong,
            DonGia = request.DonGia,
            NgayTao = DateTime.Now,
            GhiChu = request.GhiChu,
            TrangThai = "ConHang",
        };

        _context.Los.Add(lo);
        material.SoLuongTon += request.SoLuong;

        _context.LichSuTonKhos.Add(new LichSuTonKho
        {
            MaNguyenLieu = material.MaNguyenLieu,
            LoaiThayDoi = "Nhap",
            SoLuongThayDoi = request.SoLuong,
            SoLuongTruoc = material.SoLuongTon - request.SoLuong,
            SoLuongSau = material.SoLuongTon,
            GhiChu = $"Nhập lô mới: NSX {request.NgaySanXuat?.ToString("dd/MM/yyyy") ?? "N/A"}, HSD {request.HanSuDung.ToString("dd/MM/yyyy")}",
            NguoiThucHien = null,
            NgayGhiNhan = DateTime.Now,
        });

        await _context.SaveChangesAsync(ct);

        return ServiceResult<LoDto>.Ok(new LoDto
        {
            MaLo = lo.MaLo,
            MaNguyenLieu = lo.MaNguyenLieu,
            TenNguyenLieu = material.TenNguyenLieu,
            DonVi = material.DonVi,
            NgaySanXuat = lo.NgaySanXuat,
            HanSuDung = lo.HanSuDung,
            SoLuong = lo.SoLuong,
            SoLuongCon = lo.SoLuongCon,
            DonGia = lo.DonGia,
            NgayTao = lo.NgayTao,
            GhiChu = lo.GhiChu,
            TrangThai = lo.TrangThai,
            SoNgayConLai = lo.HanSuDung.DayNumber - DateOnly.FromDateTime(DateTime.Now).DayNumber,
            TinhTrang = ResolveLoTinhTrang(lo, DateOnly.FromDateTime(DateTime.Now), DateOnly.FromDateTime(DateTime.Now).AddDays(7), material.MucTonToiThieu),
        });
    }

    public async Task<ServiceResult<LoDto>> UpdateLoAsync(int maLo, UpdateLoRequest request, CancellationToken ct = default)
    {
        var lo = await _context.Los
            .Include(x => x.MaNguyenLieuNavigation)
            .FirstOrDefaultAsync(x => x.MaLo == maLo, ct);

        if (lo == null)
            return ServiceResult<LoDto>.Fail("Không tìm thấy lô.");

        if (lo.TrangThai == "HetHang")
            return ServiceResult<LoDto>.Fail("Không thể sửa lô đã hết hàng.");

        if (request.HanSuDung < DateOnly.FromDateTime(DateTime.Now))
            return ServiceResult<LoDto>.Fail("Hạn sử dụng không được nhỏ hơn ngày hiện tại.");

        lo.NgaySanXuat = request.NgaySanXuat;
        lo.HanSuDung = request.HanSuDung;
        lo.DonGia = request.DonGia;
        lo.GhiChu = request.GhiChu;

        await _context.SaveChangesAsync(ct);

        var today = DateOnly.FromDateTime(DateTime.Now);
        var warningDate = today.AddDays(7);

        return ServiceResult<LoDto>.Ok(new LoDto
        {
            MaLo = lo.MaLo,
            MaNguyenLieu = lo.MaNguyenLieu,
            TenNguyenLieu = lo.MaNguyenLieuNavigation.TenNguyenLieu,
            DonVi = lo.MaNguyenLieuNavigation.DonVi,
            NgaySanXuat = lo.NgaySanXuat,
            HanSuDung = lo.HanSuDung,
            SoLuongCon = lo.SoLuongCon,
            DonGia = lo.DonGia,
            NgayTao = lo.NgayTao,
            GhiChu = lo.GhiChu,
            TrangThai = lo.TrangThai,
            SoNgayConLai = lo.HanSuDung.DayNumber - today.DayNumber,
            TinhTrang = ResolveLoTinhTrang(lo, today, warningDate, lo.MaNguyenLieuNavigation.MucTonToiThieu),
        });
    }

    public async Task<ServiceResult> DeleteLoAsync(int maLo, CancellationToken ct = default)
    {
        var lo = await _context.Los.FirstOrDefaultAsync(x => x.MaLo == maLo, ct);

        if (lo == null)
            return ServiceResult.Fail("Không tìm thấy lô.");

        if (lo.TrangThai == "HetHang")
            return ServiceResult.Fail("Không thể xóa lô đã hết hàng.");

        var material = await _context.NguyenLieus.FirstOrDefaultAsync(x => x.MaNguyenLieu == lo.MaNguyenLieu, ct);
        if (material != null)
        {
            material.SoLuongTon -= lo.SoLuongCon;
            if (material.SoLuongTon < 0) material.SoLuongTon = 0;
        }

        _context.Los.Remove(lo);
        await _context.SaveChangesAsync(ct);

        return ServiceResult.Ok("Đã xóa lô thành công.");
    }

    public async Task<ServiceResult<ImportReceiptListItemDto>> CreateImportReceiptWithBatchAsync(
        CreateImportReceiptWithBatchRequest request, int nguoiTao, CancellationToken ct = default)
    {
        var lines = request.Lines?.Where(x => x.MaNguyenLieu > 0 && x.SoLuong > 0).ToList() ?? [];

        if (lines.Count == 0)
            return ServiceResult<ImportReceiptListItemDto>.Fail("Phiếu nhập cần ít nhất một dòng hợp lệ.");

        var materialIds = lines.Select(x => x.MaNguyenLieu).Distinct().ToList();
        var materials = await _context.NguyenLieus
            .Where(x => materialIds.Contains(x.MaNguyenLieu))
            .ToDictionaryAsync(x => x.MaNguyenLieu, ct);

        if (materials.Count != materialIds.Count)
            return ServiceResult<ImportReceiptListItemDto>.Fail("Có nguyên liệu không tồn tại.");

        foreach (var line in lines)
        {
            if (line.HanSuDung < DateOnly.FromDateTime(DateTime.Now))
                return ServiceResult<ImportReceiptListItemDto>.Fail(
                    $"Hạn sử dụng của {materials[line.MaNguyenLieu].TenNguyenLieu} không hợp lệ.");
        }

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var receipt = new PhieuNhapKho
            {
                MaNguoiTao = nguoiTao,
                MaNhaCungCap = request.MaNhaCungCap,
                NgayNhap = DateTime.Now,
                GhiChu = request.GhiChu?.Trim(),
                TrangThai = "HoanThanh",
                TongTien = 0,
            };
            _context.PhieuNhapKhos.Add(receipt);
            await _context.SaveChangesAsync(ct);

            foreach (var line in lines)
            {
                var material = materials[line.MaNguyenLieu];
                var thanhTien = line.SoLuong * line.DonGia;
                receipt.TongTien += thanhTien;

                var lo = new Lo
                {
                    MaNguyenLieu = line.MaNguyenLieu,
                    NgaySanXuat = line.NgaySanXuat,
                    HanSuDung = line.HanSuDung,
                    SoLuongCon = line.SoLuong,
                    DonGia = line.DonGia,
                    NgayTao = DateTime.Now,
                    GhiChu = line.GhiChu ?? request.GhiChu,
                    TrangThai = "ConHang",
                };
                _context.Los.Add(lo);
                await _context.SaveChangesAsync(ct);

                receipt.ChiTietPhieuNhapKhos.Add(new ChiTietPhieuNhapKho
                {
                    MaPhieuNhap = receipt.MaPhieuNhap,
                    MaNguyenLieu = line.MaNguyenLieu,
                    MaLo = lo.MaLo,
                    SoLuong = line.SoLuong,
                    DonGia = line.DonGia,
                    ThanhTien = thanhTien,
                });

                material.SoLuongTon += line.SoLuong;

                _context.LichSuTonKhos.Add(new LichSuTonKho
                {
                    MaNguyenLieu = material.MaNguyenLieu,
                    LoaiThayDoi = "Nhap",
                    SoLuongThayDoi = line.SoLuong,
                    SoLuongTruoc = material.SoLuongTon - line.SoLuong,
                    SoLuongSau = material.SoLuongTon,
                    GhiChu = $"Nhập kho tạo lô #{lo.MaLo} (HSD: {line.HanSuDung:dd/MM/yyyy})",
                    NguoiThucHien = nguoiTao,
                    NgayGhiNhan = DateTime.Now,
                });
            }

            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            var created = await _context.PhieuNhapKhos
                .AsNoTracking()
                .Include(x => x.MaNhaCungCapNavigation)
                .Include(x => x.ChiTietPhieuNhapKhos)
                    .ThenInclude(x => x.MaNguyenLieuNavigation)
                .Include(x => x.ChiTietPhieuNhapKhos)
                    .ThenInclude(x => x.MaLoNavigation)
                .FirstAsync(x => x.MaPhieuNhap == receipt.MaPhieuNhap, ct);

            return ServiceResult<ImportReceiptListItemDto>.Ok(MapImportReceipt(created));
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<ServiceResult<ExportReceiptListItemDto>> CreateExportReceiptFIFOAsync(
        CreateExportReceiptRequest request, int nguoiTao, CancellationToken ct = default)
    {
        var lines = request.Lines?.Where(x => x.MaNguyenLieu > 0 && x.SoLuong > 0).ToList() ?? [];

        if (lines.Count == 0)
            return ServiceResult<ExportReceiptListItemDto>.Fail("Phiếu xuất cần ít nhất một dòng hợp lệ.");

        var exportPlan = new List<(int MaNguyenLieu, decimal SoLuong, string? GhiChu, List<(int MaLo, decimal SoLuong, decimal? DonGia)> ChiTietLo)>();

        foreach (var line in lines)
        {
            var los = await _context.Los
                .Where(x => x.MaNguyenLieu == line.MaNguyenLieu
                    && x.TrangThai == "ConHang"
                    && x.SoLuongCon > 0
                    && x.HanSuDung >= DateOnly.FromDateTime(DateTime.Now))
                .OrderBy(x => x.HanSuDung)
                .ToListAsync(ct);

            var totalAvailable = los.Sum(x => x.SoLuongCon);
            if (totalAvailable < line.SoLuong)
                return ServiceResult<ExportReceiptListItemDto>.Fail(
                    $"Không đủ hàng trong kho cho {line.MaNguyenLieu}. Cần: {line.SoLuong}, Tồn: {totalAvailable}");

            var chiTietLo = new List<(int, decimal, decimal?)>();
            var remaining = line.SoLuong;

            foreach (var lo in los)
            {
                if (remaining <= 0) break;
                var exportFromLo = Math.Min(remaining, lo.SoLuongCon);
                chiTietLo.Add((lo.MaLo, exportFromLo, lo.DonGia));
                remaining -= exportFromLo;
            }

            exportPlan.Add((line.MaNguyenLieu, line.SoLuong, line.GhiChu, chiTietLo));
        }

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var receipt = new PhieuXuatKho
            {
                MaNguoiTao = nguoiTao,
                LyDoXuat = request.LyDoXuat?.Trim() ?? "Xuất kho",
                NgayXuat = DateTime.Now,
                GhiChu = request.GhiChu?.Trim(),
                TrangThai = "HoanThanh",
            };
            _context.PhieuXuatKhos.Add(receipt);
            await _context.SaveChangesAsync(ct);

            foreach (var (maNguyenLieu, soLuong, ghiChu, chiTietLo) in exportPlan)
            {
                foreach (var (maLo, soLuongXuat, donGia) in chiTietLo)
                {
                    receipt.ChiTietPhieuXuatKhos.Add(new ChiTietPhieuXuatKho
                    {
                        MaPhieuXuat = receipt.MaPhieuXuat,
                        MaNguyenLieu = maNguyenLieu,
                        MaLo = maLo,
                        SoLuong = soLuongXuat,
                        DonGia = donGia,
                        GhiChu = ghiChu,
                    });

                    var lo = await _context.Los.FindAsync([maLo], ct);
                    if (lo != null)
                    {
                        lo.SoLuongCon -= soLuongXuat;
                        if (lo.SoLuongCon <= 0)
                            lo.TrangThai = "HetHang";
                    }
                }

                var material = await _context.NguyenLieus.FindAsync([maNguyenLieu], ct);
                if (material != null)
                {
                    var before = material.SoLuongTon;
                    material.SoLuongTon -= soLuong;

                    _context.LichSuTonKhos.Add(new LichSuTonKho
                    {
                        MaNguyenLieu = material.MaNguyenLieu,
                        LoaiThayDoi = "Xuat",
                        SoLuongThayDoi = -soLuong,
                        SoLuongTruoc = before,
                        SoLuongSau = material.SoLuongTon,
                        GhiChu = $"Xuất kho (FIFO) - Phiếu #{receipt.MaPhieuXuat}",
                        NguoiThucHien = nguoiTao,
                        NgayGhiNhan = DateTime.Now,
                    });
                }
            }

            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            var created = await _context.PhieuXuatKhos
                .AsNoTracking()
                .Include(x => x.ChiTietPhieuXuatKhos)
                    .ThenInclude(x => x.MaNguyenLieuNavigation)
                .Include(x => x.ChiTietPhieuXuatKhos)
                    .ThenInclude(x => x.MaLoNavigation)
                .FirstAsync(x => x.MaPhieuXuat == receipt.MaPhieuXuat, ct);

            return ServiceResult<ExportReceiptListItemDto>.Ok(MapExportReceipt(created));
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    private static string ResolveLoTinhTrang(Lo lo, DateOnly today, DateOnly warningDate, decimal mucTonToiThieu)
    {
        if (lo.TrangThai == "HetHang")
            return "HetHang";
        if (lo.HanSuDung < today)
            return "DaHetHan";
        if (lo.HanSuDung <= warningDate)
            return "SapHetHan";
        if (lo.SoLuongCon <= mucTonToiThieu)
            return "SapHet";
        return "BinhThuong";
    }
}
