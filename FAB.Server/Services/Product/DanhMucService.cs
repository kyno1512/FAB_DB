using AutoMapper;
using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Product;

/// <summary>Service quản lý danh mục sản phẩm. Quy tắc: Nhập = AutoMapper · Xuất list = LINQ.</summary>
public class DanhMucService : IDanhMucService
{
    private readonly FabDbContext _context;
    private readonly IMapper _mapper;

    public DanhMucService(FabDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Lấy toàn bộ danh mục (có thể lọc chỉ danh mục đang bật).
    /// Xuất list = LINQ: Select project Entity → DanhMucResponse ngay trong SQL.
    /// </summary>
    public async Task<ServiceResult<List<DanhMucResponse>>> GetAllAsync(bool? activeOnly = null, CancellationToken ct = default)
    {
        var query = _context.DanhMucs.AsNoTracking().AsQueryable();

        if (activeOnly == true)
            query = query.Where(x => x.TrangThai);

        var items = await query
            .OrderBy(x => x.ThuTu)
            .ThenBy(x => x.TenDanhMuc)
            .Select(x => new DanhMucResponse
            {
                MaDanhMuc = x.MaDanhMuc,
                TenDanhMuc = x.TenDanhMuc,
                MoTa = x.MoTa,
                HinhAnh = x.HinhAnh,
                ThuTu = x.ThuTu,
                TrangThai = x.TrangThai,
                CoSize = x.CoSize,
                SoSanPham = x.SanPhams.Count
            })
            .ToListAsync(ct);

        return ServiceResult<List<DanhMucResponse>>.Ok(items);
    }

    /// <summary>
    /// Lấy 1 danh mục theo id.
    /// Xuất list = LINQ: Select project Entity → DanhMucResponse.
    /// </summary>
    public async Task<ServiceResult<DanhMucResponse>> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var item = await MapQuery().FirstOrDefaultAsync(x => x.MaDanhMuc == id, ct);

        if (item is null)
            return ServiceResult<DanhMucResponse>.Fail("Danh mục không tồn tại.");

        return ServiceResult<DanhMucResponse>.Ok(item);
    }

    /// <summary>
    /// Tạo danh mục mới từ form.
    /// Nhập = AutoMapper: DanhMucRequest → Entity DanhMuc, rồi lưu DB.
    /// </summary>
    public async Task<ServiceResult<DanhMucResponse>> CreateAsync(DanhMucRequest request, CancellationToken ct = default)
    {
        if (ProductRules.ValidateDanhMuc(request) is { } error)
            return ServiceResult<DanhMucResponse>.Fail(error);

        var entity = _mapper.Map<DanhMuc>(request);

        _context.DanhMucs.Add(entity);
        await _context.SaveChangesAsync(ct);

        return await GetByIdAsync(entity.MaDanhMuc, ct);
    }

    /// <summary>
    /// Cập nhật danh mục từ form.
    /// Nhập = AutoMapper: ghi DanhMucRequest lên entity đang có, rồi lưu DB.
    /// </summary>
    public async Task<ServiceResult<DanhMucResponse>> UpdateAsync(int id, DanhMucRequest request, CancellationToken ct = default)
    {
        if (ProductRules.ValidateDanhMuc(request) is { } error)
            return ServiceResult<DanhMucResponse>.Fail(error);

        var entity = await _context.DanhMucs.FirstOrDefaultAsync(x => x.MaDanhMuc == id, ct);

        if (entity is null)
            return ServiceResult<DanhMucResponse>.Fail("Danh mục không tồn tại.");

        _mapper.Map(request, entity);

        await _context.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    /// <summary>
    /// Xóa danh mục (chỉ khi chưa có sản phẩm thuộc danh mục).
    /// Thao tác trực tiếp trên Entity, không dùng AutoMapper/LINQ xuất list.
    /// </summary>
    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _context.DanhMucs.FirstOrDefaultAsync(x => x.MaDanhMuc == id, ct);

        if (entity is null)
            return ServiceResult.Fail("Danh mục không tồn tại.");

        var hasProducts = await _context.SanPhams.AnyAsync(x => x.MaDanhMuc == id, ct);

        if (hasProducts)
            return ServiceResult.Fail("Không thể xóa danh mục đang có sản phẩm.");

        _context.DanhMucs.Remove(entity);
        await _context.SaveChangesAsync(ct);

        return ServiceResult.Ok("Xóa danh mục thành công.");
    }

    private IQueryable<DanhMucResponse> MapQuery()
        => _context.DanhMucs.AsNoTracking().Select(x => new DanhMucResponse
        {
            MaDanhMuc = x.MaDanhMuc,
            TenDanhMuc = x.TenDanhMuc,
            MoTa = x.MoTa,
            HinhAnh = x.HinhAnh,
            ThuTu = x.ThuTu,
            TrangThai = x.TrangThai,
            CoSize = x.CoSize,
            SoSanPham = x.SanPhams.Count
        });
}
