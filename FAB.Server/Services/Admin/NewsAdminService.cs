using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs.News;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Admin;

public class NewsAdminService : INewsAdminService
{
    private readonly FabDbContext _context;

    public NewsAdminService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<List<NewsPostDto>>> GetAllAsync(string? search = null, CancellationToken ct = default)
    {
        var query = _context.TinTucs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x =>
                x.TieuDe.Contains(keyword) ||
                x.DanhMuc.Contains(keyword) ||
                x.TomTat.Contains(keyword));
        }

        var rows = await query
            .OrderByDescending(x => x.NgayDang)
            .ThenByDescending(x => x.MaTinTuc)
            .ToListAsync(ct);

        return ServiceResult<List<NewsPostDto>>.Ok(rows.Select(NewsMapper.ToDto).ToList());
    }

    public async Task<ServiceResult<NewsPostDto>> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var row = await _context.TinTucs.AsNoTracking().FirstOrDefaultAsync(x => x.MaTinTuc == id, ct);
        if (row is null)
            return ServiceResult<NewsPostDto>.Fail("Không tìm thấy bài viết.");

        return ServiceResult<NewsPostDto>.Ok(NewsMapper.ToDto(row));
    }

    public async Task<ServiceResult<NewsPostDto>> CreateAsync(UpsertNewsRequest request, CancellationToken ct = default)
    {
        var validation = Validate(request);
        if (validation is not null)
            return ServiceResult<NewsPostDto>.Fail(validation);

        var now = DateTime.Now;
        var entity = new TinTuc
        {
            TieuDe = request.TieuDe.Trim(),
            DanhMuc = request.DanhMuc.Trim(),
            TomTat = request.TomTat.Trim(),
            NoiDung = request.NoiDung?.Trim(),
            AnhDaiDien = request.AnhDaiDien?.Trim(),
            AnhPhu = NewsMapper.SerializeExtraImages(request.AnhPhu),
            TrangThai = NormalizeStatus(request.TrangThai),
            NgayDang = request.NgayDang ?? now,
            NgayTao = now,
        };

        _context.TinTucs.Add(entity);
        await _context.SaveChangesAsync(ct);
        return ServiceResult<NewsPostDto>.Ok(NewsMapper.ToDto(entity));
    }

    public async Task<ServiceResult<NewsPostDto>> UpdateAsync(int id, UpsertNewsRequest request, CancellationToken ct = default)
    {
        var validation = Validate(request);
        if (validation is not null)
            return ServiceResult<NewsPostDto>.Fail(validation);

        var entity = await _context.TinTucs.FirstOrDefaultAsync(x => x.MaTinTuc == id, ct);
        if (entity is null)
            return ServiceResult<NewsPostDto>.Fail("Không tìm thấy bài viết.");

        entity.TieuDe = request.TieuDe.Trim();
        entity.DanhMuc = request.DanhMuc.Trim();
        entity.TomTat = request.TomTat.Trim();
        entity.NoiDung = request.NoiDung?.Trim();
        entity.AnhDaiDien = request.AnhDaiDien?.Trim();
        entity.AnhPhu = NewsMapper.SerializeExtraImages(request.AnhPhu);
        entity.TrangThai = NormalizeStatus(request.TrangThai);
        entity.NgayDang = request.NgayDang ?? entity.NgayDang;
        entity.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync(ct);
        return ServiceResult<NewsPostDto>.Ok(NewsMapper.ToDto(entity));
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _context.TinTucs.FirstOrDefaultAsync(x => x.MaTinTuc == id, ct);
        if (entity is null)
            return ServiceResult.Fail("Không tìm thấy bài viết.");

        _context.TinTucs.Remove(entity);
        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok("Đã xóa bài viết.");
    }

    public async Task<ServiceResult<int>> DeleteManyAsync(IReadOnlyList<int> ids, CancellationToken ct = default)
    {
        if (ids.Count == 0)
            return ServiceResult<int>.Fail("Chưa chọn bài viết.");

        var rows = await _context.TinTucs.Where(x => ids.Contains(x.MaTinTuc)).ToListAsync(ct);
        if (rows.Count == 0)
            return ServiceResult<int>.Fail("Không tìm thấy bài viết.");

        _context.TinTucs.RemoveRange(rows);
        await _context.SaveChangesAsync(ct);
        return ServiceResult<int>.Ok(rows.Count);
    }

    private static string? Validate(UpsertNewsRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TieuDe))
            return "Tiêu đề không được để trống.";
        if (string.IsNullOrWhiteSpace(request.TomTat))
            return "Tóm tắt không được để trống.";
        if (string.IsNullOrWhiteSpace(request.DanhMuc))
            return "Danh mục không được để trống.";
        return null;
    }

    private static string NormalizeStatus(string? status) =>
        string.Equals(status, "DangDang", StringComparison.OrdinalIgnoreCase) ? "DangDang" : "Nhap";
}
