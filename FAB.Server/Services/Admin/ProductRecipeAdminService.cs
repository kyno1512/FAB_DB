using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Admin;

internal record BomCountRecord(int MaSanPham, int SoDong);
internal record CanBanRecord(int MaSanPham, int CanBan);

public class ProductRecipeAdminService : IProductRecipeAdminService
{
    private readonly FabDbContext _context;

    public ProductRecipeAdminService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<PagedResult<ProductRecipeListItemDto>>> GetPagedAsync(
        int page,
        int pageSize,
        string? search,
        string? filter,
        CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var comboCategoryId = await GetComboCategoryIdAsync(ct);
        var query = _context.SanPhams.AsNoTracking().AsQueryable();

        if (comboCategoryId is > 0)
            query = query.Where(x => x.MaDanhMuc != comboCategoryId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x =>
                x.TenSanPham.Contains(keyword) ||
                x.MaDanhMucNavigation.TenDanhMuc.Contains(keyword));
        }

        if (string.Equals(filter, "hasBom", StringComparison.OrdinalIgnoreCase))
            query = query.Where(x => x.CongThucSanPhams.Any());

        if (string.Equals(filter, "noBom", StringComparison.OrdinalIgnoreCase))
            query = query.Where(x => !x.CongThucSanPhams.Any());

        var totalCount = await query.CountAsync(ct);

        var productIds = await query
            .OrderBy(x => x.TenSanPham)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.MaSanPham)
            .ToListAsync(ct);

        if (productIds.Count == 0)
        {
            return ServiceResult<PagedResult<ProductRecipeListItemDto>>.Ok(new PagedResult<ProductRecipeListItemDto>
            {
                Items = [],
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
            });
        }

        var bomCounts = await _context.CongThucSanPhams
            .AsNoTracking()
            .Where(b => productIds.Contains(b.MaSanPham))
            .GroupBy(b => b.MaSanPham)
            .Select(g => new BomCountRecord(g.Key, g.Count()))
            .ToListAsync(ct);

        var canBanList = await _context.CongThucSanPhams
            .AsNoTracking()
            .Where(b => productIds.Contains(b.MaSanPham) && b.MaNguyenLieuNavigation.TrangThai && b.SoLuong > 0)
            .Select(b => new CanBanRecord(b.MaSanPham, (int)Math.Floor(b.MaNguyenLieuNavigation.SoLuongTon / b.SoLuong)))
            .ToListAsync(ct);

        var bomDict = bomCounts.ToDictionary(x => x.MaSanPham);
        var minCanBan = canBanList
            .GroupBy(x => x.MaSanPham)
            .ToDictionary(g => g.Key, g => g.Min(x => x.CanBan));

        var items = await _context.SanPhams
            .AsNoTracking()
            .Where(x => productIds.Contains(x.MaSanPham))
            .OrderBy(x => x.TenSanPham)
            .Select(x => new ProductRecipeListItemDto
            {
                MaSanPham = x.MaSanPham,
                TenSanPham = x.TenSanPham,
                TenDanhMuc = x.MaDanhMucNavigation.TenDanhMuc,
                TrangThai = x.TrangThai,
                HinhAnhChinh = x.HinhAnhSanPhams
                    .OrderByDescending(h => h.LaAnhChinh)
                    .ThenBy(h => h.ThuTu)
                    .Select(h => h.DuongDan)
                    .FirstOrDefault(),
                SoDongCongThuc = x.CongThucSanPhams.Count,
                CoCongThuc = x.CongThucSanPhams.Any(),
                SoLuongCoTheBan = 0
            })
            .ToListAsync(ct);

        foreach (var item in items)
        {
            if (bomDict.TryGetValue(item.MaSanPham, out var bom) && bom.SoDong > 0)
            {
                item.SoDongCongThuc = bom.SoDong;
                item.CoCongThuc = true;
                item.SoLuongCoTheBan = minCanBan.TryGetValue(item.MaSanPham, out var m) ? m : 0;
            }
            else
            {
                item.SoLuongCoTheBan = -1;
            }
        }

        return ServiceResult<PagedResult<ProductRecipeListItemDto>>.Ok(new PagedResult<ProductRecipeListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        });
    }

    public async Task<ServiceResult<ProductRecipeStatsDto>> GetStatsAsync(CancellationToken ct = default)
    {
        var comboCategoryId = await GetComboCategoryIdAsync(ct);
        var query = _context.SanPhams.AsNoTracking().AsQueryable();

        if (comboCategoryId is > 0)
            query = query.Where(x => x.MaDanhMuc != comboCategoryId);

        var total = await query.CountAsync(ct);
        var withBom = await query.CountAsync(x => x.CongThucSanPhams.Any(), ct);

        return ServiceResult<ProductRecipeStatsDto>.Ok(new ProductRecipeStatsDto
        {
            TongMon = total,
            DaCoCongThuc = withBom,
            ChuaCoCongThuc = total - withBom,
        });
    }

    public async Task<ServiceResult<ProductRecipeDetailDto>> GetByProductIdAsync(int maSanPham, CancellationToken ct = default)
    {
        var item = await _context.SanPhams
            .AsNoTracking()
            .Where(x => x.MaSanPham == maSanPham)
            .Select(x => new ProductRecipeDetailDto
            {
                MaSanPham = x.MaSanPham,
                TenSanPham = x.TenSanPham,
                TenDanhMuc = x.MaDanhMucNavigation.TenDanhMuc,
                BomItems = x.CongThucSanPhams
                    .Select(b => new ProductBomDto
                    {
                        MaCongThuc = b.MaCongThuc,
                        MaNguyenLieu = b.MaNguyenLieu,
                        TenNguyenLieu = b.MaNguyenLieuNavigation.TenNguyenLieu,
                        SoLuong = b.SoLuong,
                        DonVi = b.DonVi,
                        GhiChu = b.GhiChu,
                        SoLuongTon = b.MaNguyenLieuNavigation.SoLuongTon,
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync(ct);

        if (item is null)
            return ServiceResult<ProductRecipeDetailDto>.Fail("Sản phẩm không tồn tại.");

        var comboCategoryId = await GetComboCategoryIdAsync(ct);
        var isCombo = await _context.SanPhams
            .AsNoTracking()
            .AnyAsync(x => x.MaSanPham == maSanPham && comboCategoryId != null && x.MaDanhMuc == comboCategoryId, ct);

        if (isCombo)
            return ServiceResult<ProductRecipeDetailDto>.Fail("Combo lấy công thức từ các món con, không chỉnh tại đây.");

        return ServiceResult<ProductRecipeDetailDto>.Ok(item);
    }

    public async Task<ServiceResult<ProductRecipeDetailDto>> UpdateAsync(
        int maSanPham,
        UpdateProductRecipeRequest request,
        CancellationToken ct = default)
    {
        var entity = await _context.SanPhams
            .Include(x => x.CongThucSanPhams)
            .FirstOrDefaultAsync(x => x.MaSanPham == maSanPham, ct);

        if (entity is null)
            return ServiceResult<ProductRecipeDetailDto>.Fail("Sản phẩm không tồn tại.");

        var comboCategoryId = await GetComboCategoryIdAsync(ct);
        if (comboCategoryId is > 0 && entity.MaDanhMuc == comboCategoryId)
            return ServiceResult<ProductRecipeDetailDto>.Fail("Combo lấy công thức từ các món con, không chỉnh tại đây.");

        var lines = request.BomItems?
            .Where(x => x.MaNguyenLieu > 0 && x.SoLuong > 0)
            .ToList() ?? [];

        if (lines.Count > 0)
        {
            if (lines.Any(x => string.IsNullOrWhiteSpace(x.DonVi)))
                return ServiceResult<ProductRecipeDetailDto>.Fail("Đơn vị nguyên liệu không được để trống.");

            var materialIds = lines.Select(x => x.MaNguyenLieu).Distinct().ToList();
            var validCount = await _context.NguyenLieus
                .CountAsync(x => materialIds.Contains(x.MaNguyenLieu) && x.TrangThai, ct);

            if (validCount != materialIds.Count)
                return ServiceResult<ProductRecipeDetailDto>.Fail("Có nguyên liệu không tồn tại hoặc đã ngưng.");
        }

        _context.CongThucSanPhams.RemoveRange(entity.CongThucSanPhams);

        foreach (var line in lines)
        {
            _context.CongThucSanPhams.Add(new CongThucSanPham
            {
                MaSanPham = maSanPham,
                MaNguyenLieu = line.MaNguyenLieu,
                SoLuong = line.SoLuong,
                DonVi = line.DonVi.Trim(),
                GhiChu = line.GhiChu?.Trim(),
            });
        }

        await _context.SaveChangesAsync(ct);
        return await GetByProductIdAsync(maSanPham, ct);
    }

    public async Task<ServiceResult> DeleteAsync(int maSanPham, int maCongThuc, CancellationToken ct = default)
    {
        var comboCategoryId = await GetComboCategoryIdAsync(ct);
        var isCombo = comboCategoryId is > 0 && await _context.SanPhams.AnyAsync(x => x.MaSanPham == maSanPham && x.MaDanhMuc == comboCategoryId, ct);
        if (isCombo)
            return ServiceResult.Fail("Combo lấy công thức từ các món con, không chỉnh tại đây.");

        var recipe = await _context.CongThucSanPhams
            .FirstOrDefaultAsync(x => x.MaCongThuc == maCongThuc && x.MaSanPham == maSanPham, ct);

        if (recipe is null)
            return ServiceResult.Fail("Không tìm thấy công thức cần xóa.");

        _context.CongThucSanPhams.Remove(recipe);
        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok("Xóa công thức thành công.");
    }

    public async Task<ServiceResult> DeleteMultipleAsync(List<int> maCongThucIds, CancellationToken ct = default)
    {
        if (maCongThucIds == null || maCongThucIds.Count == 0)
            return ServiceResult.Fail("Danh sách cần xóa trống.");

        var recipes = await _context.CongThucSanPhams
            .Where(x => maCongThucIds.Contains(x.MaCongThuc))
            .ToListAsync(ct);

        if (recipes.Count == 0)
            return ServiceResult.Fail("Không tìm thấy công thức nào để xóa.");

        _context.CongThucSanPhams.RemoveRange(recipes);
        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok($"Đã xóa {recipes.Count} công thức.");
    }

    private Task<int?> GetComboCategoryIdAsync(CancellationToken ct)
        => _context.DanhMucs
            .Where(d => d.TenDanhMuc == "Combo")
            .Select(d => (int?)d.MaDanhMuc)
            .FirstOrDefaultAsync(ct);
}
