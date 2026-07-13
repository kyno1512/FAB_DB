using AutoMapper;
using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Product;

/// <summary>Service quản lý sản phẩm. Quy tắc: Nhập = AutoMapper · Xuất list = LINQ.</summary>
public class SanPhamService : ISanPhamService
{
    private readonly FabDbContext _context;
    private readonly IMapper _mapper;

    public SanPhamService(FabDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Lấy danh sách sản phẩm có phân trang, tìm kiếm, lọc danh mục/trạng thái, sắp xếp.
    /// Xuất list = LINQ: Select project Entity → SanPhamListItemResponse (join danh mục, chọn ảnh chính).
    /// </summary>
    public async Task<ServiceResult<PagedResult<SanPhamListItemResponse>>> GetPagedAsync(
        int page,
        int pageSize,
        string? search,
        int? maDanhMuc,
        bool? trangThai,
        string? sort,
        CancellationToken ct = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = _context.SanPhams.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim();
            query = query.Where(x => x.TenSanPham.Contains(keyword) || (x.MoTa != null && x.MoTa.Contains(keyword)));
        }

        if (maDanhMuc is > 0)
            query = query.Where(x => x.MaDanhMuc == maDanhMuc);

        if (trangThai.HasValue)
            query = query.Where(x => x.TrangThai == trangThai);

        query = ApplySort(query, sort);

        var totalCount = await query.CountAsync(ct);

        // Query entities trước để có tracking, sau đó map sang DTO với ConHang/CoTheBan
        var entities = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.CongThucSanPhams)
                .ThenInclude(c => c.MaNguyenLieuNavigation)
            .Include(x => x.ComboChiTiets)
                .ThenInclude(c => c.MaSanPhamConNavigation)
                    .ThenInclude(s => s.CongThucSanPhams)
                        .ThenInclude(ct => ct.MaNguyenLieuNavigation)
            .Include(x => x.HinhAnhSanPhams)
            .Include(x => x.MaDanhMucNavigation)
            .AsNoTracking()
            .ToListAsync(ct);

        // Map sang DTO với ConHang và CoTheBan đã tính
        var items = entities.Select(x =>
        {
            var dto = new SanPhamListItemResponse
            {
                MaSanPham = x.MaSanPham,
                MaDanhMuc = x.MaDanhMuc,
                TenDanhMuc = x.MaDanhMucNavigation?.TenDanhMuc ?? "",
                TenSanPham = x.TenSanPham,
                MoTa = x.MoTa,
                GiaBan = x.GiaBan,
                GiaGoc = x.GiaGoc,
                DonVi = x.DonVi,
                TrangThai = x.TrangThai,
                NgayTao = x.NgayTao,
                HinhAnhChinh = x.HinhAnhSanPhams
                    ?.OrderByDescending(h => h.LaAnhChinh)
                    .ThenBy(h => h.ThuTu)
                    .Select(h => h.DuongDan)
                    .FirstOrDefault(),
                SoLuongBan = x.ChiTietDonHangs
                    .Sum(c => (int?)(c.SoLuong > 0 ? c.SoLuong : 0)) ?? 0,
            };

            // Tính CoTheBan và ConHang
            if (x.CongThucSanPhams.Any())
            {
                // Sản phẩm thường - tính từ công thức
                decimal minCoTheBan = 999999;
                foreach (var ct in x.CongThucSanPhams)
                {
                    if (ct.SoLuong > 0 && ct.MaNguyenLieuNavigation != null)
                    {
                        var coTheBan = ct.MaNguyenLieuNavigation.SoLuongTon / ct.SoLuong;
                        if (coTheBan < minCoTheBan)
                            minCoTheBan = coTheBan;
                    }
                }
                dto.CoTheBan = minCoTheBan == 999999 ? 0 : (int)minCoTheBan;
                dto.ConHang = dto.CoTheBan > 0;
            }
            else if (x.ComboChiTiets.Any())
            {
                // Combo - tính từ nguyên liệu của các món con
                var childMaxList = new List<int>();
                foreach (var child in x.ComboChiTiets)
                {
                    var childRecipes = child.MaSanPhamConNavigation?.CongThucSanPhams;
                    if (childRecipes == null || !childRecipes.Any())
                    {
                        childMaxList.Add(0);
                        continue;
                    }

                    decimal minForChild = 999999;
                    foreach (var ct in childRecipes)
                    {
                        if (ct.SoLuong > 0 && ct.MaNguyenLieuNavigation != null)
                        {
                            var coTheBan = ct.MaNguyenLieuNavigation.SoLuongTon / ct.SoLuong;
                            if (coTheBan < minForChild)
                                minForChild = coTheBan;
                        }
                    }
                    // Combo max = min(max của món con / số lượng trong combo)
                    var childMax = minForChild == 999999 ? 0 : (int)minForChild;
                    childMaxList.Add(childMax / child.SoLuong);
                }
                dto.CoTheBan = childMaxList.Count > 0 ? childMaxList.Min() : 0;
                dto.ConHang = dto.CoTheBan > 0;
            }
            else
            {
                dto.CoTheBan = 999;
                dto.ConHang = true;
            }

            return dto;
        }).ToList();

        Console.WriteLine($"[DEBUG RETURN] Total items: {items.Count}, First item ConHang: {items.FirstOrDefault()?.ConHang}, CoTheBan: {items.FirstOrDefault()?.CoTheBan}");

        return ServiceResult<PagedResult<SanPhamListItemResponse>>.Ok(new PagedResult<SanPhamListItemResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    public async Task<ServiceResult<List<ProductSearchTagDto>>> GetSearchTagsAsync(CancellationToken ct = default)
    {
        var categoryTags = await _context.DanhMucs
            .AsNoTracking()
            .Where(d => d.TrangThai)
            .Select(d => new ProductSearchTagDto
            {
                Label = d.TenDanhMuc,
                Count = d.SanPhams.Count(s => s.TrangThai),
                MaDanhMuc = d.MaDanhMuc,
            })
            .Where(t => t.Count > 0)
            .OrderByDescending(t => t.Count)
            .ThenBy(t => t.Label)
            .Take(4)
            .ToListAsync(ct);

        var productTags = await _context.SanPhams
            .AsNoTracking()
            .Where(s => s.TrangThai)
            .OrderByDescending(s => s.NgayTao)
            .Take(4)
            .Select(s => new ProductSearchTagDto
            {
                Label = s.TenSanPham,
                Count = 1,
                Search = s.TenSanPham,
            })
            .ToListAsync(ct);

        var tags = categoryTags
            .Concat(productTags)
            .Take(6)
            .ToList();

        return ServiceResult<List<ProductSearchTagDto>>.Ok(tags);
    }

    /// <summary>
    /// Lấy chi tiết 1 sản phẩm (kèm danh sách ảnh và topping).
    /// </summary>
    public async Task<ServiceResult<SanPhamDetailResponse>> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var product = await _context.SanPhams
            .AsNoTracking()
            .Include(x => x.CongThucSanPhams).ThenInclude(b => b.MaNguyenLieuNavigation)
            .Include(x => x.HinhAnhSanPhams)
            .Include(x => x.SanPhamToppings).ThenInclude(t => t.MaToppingNavigation)
            .Include(x => x.ComboChiTiets).ThenInclude(c => c.MaSanPhamConNavigation).ThenInclude(p => p.HinhAnhSanPhams)
            .Include(x => x.GiaSanPhamTheoSizes).ThenInclude(g => g.MaSizeNavigation)
            .Include(x => x.MaDanhMucNavigation)
            .FirstOrDefaultAsync(x => x.MaSanPham == id, ct);

        if (product is null)
            return ServiceResult<SanPhamDetailResponse>.Fail("Sản phẩm không tồn tại.");

        var item = MapDetailFromEntity(product);

        // Tính CoTheBan và ConHang
        if (product.CongThucSanPhams.Any())
        {
            item.CoTheBan = (int)product.CongThucSanPhams
                .Min(b => b.MaNguyenLieuNavigation.SoLuongTon / b.SoLuong);
            item.ConHang = product.CongThucSanPhams.Any(b => b.MaNguyenLieuNavigation.SoLuongTon > 0);
        }
        else
        {
            item.CoTheBan = 999;
            item.ConHang = true;
        }

        return ServiceResult<SanPhamDetailResponse>.Ok(item);
    }

    private static SanPhamDetailResponse MapDetailFromEntity(SanPham product)
    {
        var item = new SanPhamDetailResponse
        {
            MaSanPham = product.MaSanPham,
            MaDanhMuc = product.MaDanhMuc,
            TenDanhMuc = product.MaDanhMucNavigation.TenDanhMuc,
            TenSanPham = product.TenSanPham,
            MoTa = product.MoTa,
            GiaBan = product.GiaBan,
            GiaGoc = product.GiaGoc,
            DonVi = product.DonVi,
            TrangThai = product.TrangThai,
            NgayTao = product.NgayTao,
            HinhAnhs = product.HinhAnhSanPhams?
                .OrderByDescending(h => h.LaAnhChinh)
                .ThenBy(h => h.ThuTu)
                .Select(h => new HinhAnhSanPhamDto
                {
                    MaHinhAnh = h.MaHinhAnh,
                    DuongDan = h.DuongDan,
                    LaAnhChinh = h.LaAnhChinh,
                    ThuTu = h.ThuTu
                })
                .ToList() ?? new List<HinhAnhSanPhamDto>(),
            Toppings = product.SanPhamToppings?
                .Select(t => new SanPhamToppingDto
                {
                    MaTopping = t.MaTopping,
                    TenTopping = t.MaToppingNavigation?.TenTopping ?? "",
                    Gia = t.MaToppingNavigation?.Gia ?? 0,
                    GiaThem = t.GiaThem
                })
                .ToList() ?? new List<SanPhamToppingDto>(),
            ComboItems = product.ComboChiTiets?
                .OrderBy(c => c.ThuTu)
                .Select(c => new ComboChiTietDto
                {
                    MaSanPhamCon = c.MaSanPhamCon,
                    TenSanPham = c.MaSanPhamConNavigation?.TenSanPham ?? "",
                    TenDanhMuc = c.MaSanPhamConNavigation?.MaDanhMucNavigation?.TenDanhMuc ?? "",
                    GiaBan = c.MaSanPhamConNavigation?.GiaBan ?? 0,
                    SoLuong = c.SoLuong,
                    ThuTu = c.ThuTu,
                    HinhAnhChinh = c.MaSanPhamConNavigation?.HinhAnhSanPhams
                        ?.OrderByDescending(h => h.LaAnhChinh)
                        .ThenBy(h => h.ThuTu)
                        .Select(h => h.DuongDan)
                        .FirstOrDefault()
                })
                .ToList() ?? new List<ComboChiTietDto>(),
            BomItems = product.CongThucSanPhams?
                .Select(b => new ProductBomDto
                {
                    MaCongThuc = b.MaCongThuc,
                    MaNguyenLieu = b.MaNguyenLieu,
                    TenNguyenLieu = b.MaNguyenLieuNavigation?.TenNguyenLieu ?? "",
                    SoLuong = b.SoLuong,
                    DonVi = b.DonVi,
                    GhiChu = b.GhiChu,
                    SoLuongTon = b.MaNguyenLieuNavigation?.SoLuongTon ?? 0,
                })
                .ToList() ?? new List<ProductBomDto>(),
            CoSize = product.MaDanhMucNavigation.CoSize,
            GiaTheoSizes = product.GiaSanPhamTheoSizes?
                .OrderBy(g => g.MaSizeNavigation?.ThuTu ?? 0)
                .Select(g => new GiaSanPhamTheoSizeResponse
                {
                    MaGia = g.MaGia,
                    MaSanPham = g.MaSanPham,
                    MaSize = g.MaSize,
                    TenSize = g.MaSizeNavigation?.TenSize ?? "",
                    Gia = g.Gia,
                    HeSoGia = g.MaSizeNavigation?.HeSoGia ?? 1
                })
                .ToList() ?? new List<GiaSanPhamTheoSizeResponse>(),
        };
        return item;
    }

    /// <summary>
    /// Tạo sản phẩm mới từ form (kèm ảnh và topping nếu có).
    /// Nhập = AutoMapper: SanPhamCreateRequest → Entity SanPham; ảnh/topping lưu bảng riêng.
    /// </summary>
    public async Task<ServiceResult<SanPhamDetailResponse>> CreateAsync(SanPhamCreateRequest request, CancellationToken ct = default)
    {
        if (ProductRules.ValidateSanPhamCreate(request) is { } error)
            return ServiceResult<SanPhamDetailResponse>.Fail(error);

        if (await ValidateComboItemsBusinessAsync(request.MaDanhMuc, request.ComboItems, null, ct) is { } comboError)
            return ServiceResult<SanPhamDetailResponse>.Fail(comboError);

        if (await ValidateBomItemsAsync(request.MaDanhMuc, request.BomItems, ct) is { } bomError)
            return ServiceResult<SanPhamDetailResponse>.Fail(bomError);

        if (!await _context.DanhMucs.AnyAsync(x => x.MaDanhMuc == request.MaDanhMuc, ct))
            return ServiceResult<SanPhamDetailResponse>.Fail("Danh mục không tồn tại.");

        if (request.Toppings.Count > 0)
        {
            var toppingIds = request.Toppings.Select(x => x.MaTopping).Distinct().ToList();
            var validCount = await _context.Toppings.CountAsync(x => toppingIds.Contains(x.MaTopping) && x.TrangThai, ct);

            if (validCount != toppingIds.Count)
                return ServiceResult<SanPhamDetailResponse>.Fail("Có topping không tồn tại hoặc đã ngưng.");
        }

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var entity = _mapper.Map<SanPham>(request);

            _context.SanPhams.Add(entity);
            await _context.SaveChangesAsync(ct);

            await AddImagesAsync(entity.MaSanPham, request.HinhAnhs, ct);
            await AddToppingsAsync(entity.MaSanPham, request.Toppings, ct);
            await SyncComboItemsAsync(entity.MaSanPham, request.MaDanhMuc, request.ComboItems, ct);
            await SyncBomItemsAsync(entity.MaSanPham, request.MaDanhMuc, request.BomItems, ct);
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return await GetByIdAsync(entity.MaSanPham, ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    /// <summary>
    /// Cập nhật sản phẩm từ form (thay ảnh và topping).
    /// Nhập = AutoMapper: ghi SanPhamUpdateRequest lên entity; ảnh/topping xóa cũ rồi thêm mới.
    /// </summary>
    public async Task<ServiceResult<SanPhamDetailResponse>> UpdateAsync(int id, SanPhamUpdateRequest request, CancellationToken ct = default)
    {
        if (ProductRules.ValidateSanPhamUpdate(request, id) is { } error)
            return ServiceResult<SanPhamDetailResponse>.Fail(error);

        if (await ValidateComboItemsBusinessAsync(request.MaDanhMuc, request.ComboItems, id, ct) is { } comboError)
            return ServiceResult<SanPhamDetailResponse>.Fail(comboError);

        if (await ValidateBomItemsAsync(request.MaDanhMuc, request.BomItems, ct) is { } bomError)
            return ServiceResult<SanPhamDetailResponse>.Fail(bomError);

        var entity = await _context.SanPhams
            .Include(x => x.HinhAnhSanPhams)
            .Include(x => x.SanPhamToppings)
            .Include(x => x.ComboChiTiets)
            .Include(x => x.CongThucSanPhams)
            .FirstOrDefaultAsync(x => x.MaSanPham == id, ct);

        if (entity is null)
            return ServiceResult<SanPhamDetailResponse>.Fail("Sản phẩm không tồn tại.");

        if (!await _context.DanhMucs.AnyAsync(x => x.MaDanhMuc == request.MaDanhMuc, ct))
            return ServiceResult<SanPhamDetailResponse>.Fail("Danh mục không tồn tại.");

        if (request.Toppings.Count > 0)
        {
            var toppingIds = request.Toppings.Select(x => x.MaTopping).Distinct().ToList();
            var validCount = await _context.Toppings.CountAsync(x => toppingIds.Contains(x.MaTopping) && x.TrangThai, ct);

            if (validCount != toppingIds.Count)
                return ServiceResult<SanPhamDetailResponse>.Fail("Có topping không tồn tại hoặc đã ngưng.");
        }

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            _mapper.Map(request, entity);

            _context.HinhAnhSanPhams.RemoveRange(entity.HinhAnhSanPhams);
            _context.SanPhamToppings.RemoveRange(entity.SanPhamToppings);
            _context.ComboChiTiets.RemoveRange(entity.ComboChiTiets);
            _context.CongThucSanPhams.RemoveRange(entity.CongThucSanPhams);
            await _context.SaveChangesAsync(ct);

            await AddImagesAsync(id, request.HinhAnhs, ct);
            await AddToppingsAsync(id, request.Toppings, ct);
            await SyncComboItemsAsync(id, request.MaDanhMuc, request.ComboItems, ct);
            await SyncBomItemsAsync(id, request.MaDanhMuc, request.BomItems, ct);
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return await GetByIdAsync(id, ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<ServiceResult<SanPhamDetailResponse>> ApplyHotDealAsync(
        int id, int phanTramGiam, CancellationToken ct = default)
    {
        if (phanTramGiam < 1 || phanTramGiam > 100)
            return ServiceResult<SanPhamDetailResponse>.Fail("Phần trăm giảm phải từ 1 đến 100.");

        var entity = await _context.SanPhams.FirstOrDefaultAsync(x => x.MaSanPham == id, ct);
        if (entity is null)
            return ServiceResult<SanPhamDetailResponse>.Fail("Sản phẩm không tồn tại.");

        var basePrice = entity.GiaGoc ?? entity.GiaBan;
        entity.GiaGoc ??= entity.GiaBan;
        entity.GiaBan = Math.Round(basePrice * (100 - phanTramGiam) / 100m, 0, MidpointRounding.AwayFromZero);

        await _context.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<ServiceResult<SanPhamDetailResponse>> RemoveHotDealAsync(
        int id, CancellationToken ct = default)
    {
        var entity = await _context.SanPhams.FirstOrDefaultAsync(x => x.MaSanPham == id, ct);
        if (entity is null)
            return ServiceResult<SanPhamDetailResponse>.Fail("Sản phẩm không tồn tại.");

        if (entity.GiaGoc is null || entity.GiaBan >= entity.GiaGoc)
            return ServiceResult<SanPhamDetailResponse>.Fail("Sản phẩm này không có khuyến mãi sốc.");

        entity.GiaBan = (int)entity.GiaGoc.Value;
        entity.GiaGoc = null;

        await _context.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    /// <summary>
    /// Xóa sản phẩm khỏi thực đơn (hard delete). Ngưng bán dùng UpdateAsync (TrangThai = false).
    /// </summary>
    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _context.SanPhams.FirstOrDefaultAsync(x => x.MaSanPham == id, ct);

        if (entity is null)
            return ServiceResult.Fail("Sản phẩm không tồn tại.");

        var inOrders = await _context.ChiTietDonHangs.AnyAsync(x => x.MaSanPham == id, ct);
        if (inOrders)
            return ServiceResult.Fail("Không thể xóa món đã có trong đơn hàng. Hãy tắt \"Đang bán\" trong phần chỉnh sửa.");

        var usedInCombo = await _context.ComboChiTiets.AnyAsync(x => x.MaSanPhamCon == id, ct);
        if (usedInCombo)
            return ServiceResult.Fail("Không thể xóa món đang nằm trong combo. Hãy sửa combo trước.");

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            _context.ChiTietGioHangs.RemoveRange(
                await _context.ChiTietGioHangs.Where(x => x.MaSanPham == id).ToListAsync(ct));
            _context.DanhGiaSanPhams.RemoveRange(
                await _context.DanhGiaSanPhams.Where(x => x.MaSanPham == id).ToListAsync(ct));
            _context.CongThucSanPhams.RemoveRange(
                await _context.CongThucSanPhams.Where(x => x.MaSanPham == id).ToListAsync(ct));
            _context.HinhAnhSanPhams.RemoveRange(
                await _context.HinhAnhSanPhams.Where(x => x.MaSanPham == id).ToListAsync(ct));
            _context.SanPhamToppings.RemoveRange(
                await _context.SanPhamToppings.Where(x => x.MaSanPham == id).ToListAsync(ct));
            _context.ComboChiTiets.RemoveRange(
                await _context.ComboChiTiets.Where(x => x.MaCombo == id).ToListAsync(ct));

            _context.SanPhams.Remove(entity);
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return ServiceResult.Ok("Xóa sản phẩm thành công.");
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    private static IQueryable<SanPham> ApplySort(IQueryable<SanPham> query, string? sort)
        => sort?.ToLowerInvariant() switch
        {
            "oldest" => query.OrderBy(x => x.NgayTao),
            "price_asc" => query.OrderBy(x => x.GiaBan),
            "price_desc" => query.OrderByDescending(x => x.GiaBan),
            "name" => query.OrderBy(x => x.TenSanPham),
            _ => query.OrderByDescending(x => x.NgayTao)
        };

    private async Task AddImagesAsync(int maSanPham, List<HinhAnhSanPhamDto> hinhAnhs, CancellationToken ct)
    {
        if (hinhAnhs.Count == 0)
            return;

        var hasMain = hinhAnhs.Any(x => x.LaAnhChinh);

        for (var i = 0; i < hinhAnhs.Count; i++)
        {
            var item = hinhAnhs[i];

            if (string.IsNullOrWhiteSpace(item.DuongDan))
                continue;

            _context.HinhAnhSanPhams.Add(new HinhAnhSanPham
            {
                MaSanPham = maSanPham,
                DuongDan = item.DuongDan.Trim(),
                LaAnhChinh = hasMain ? item.LaAnhChinh : i == 0,
                ThuTu = item.ThuTu > 0 ? item.ThuTu : i
            });
        }

        await Task.CompletedTask;
    }

    private async Task AddToppingsAsync(int maSanPham, List<SanPhamToppingInputDto> toppings, CancellationToken ct)
    {
        foreach (var item in toppings)
        {
            _context.SanPhamToppings.Add(new SanPhamTopping
            {
                MaSanPham = maSanPham,
                MaTopping = item.MaTopping,
                GiaThem = item.GiaThem
            });
        }

        await Task.CompletedTask;
    }

    private async Task SyncComboItemsAsync(
        int maCombo,
        int maDanhMuc,
        List<ComboChiTietInputDto> comboItems,
        CancellationToken ct)
    {
        if (!await IsComboCategoryAsync(maDanhMuc, ct) || comboItems.Count == 0)
            return;

        for (var i = 0; i < comboItems.Count; i++)
        {
            var item = comboItems[i];
            _context.ComboChiTiets.Add(new ComboChiTiet
            {
                MaCombo = maCombo,
                MaSanPhamCon = item.MaSanPhamCon,
                SoLuong = item.SoLuong > 0 ? item.SoLuong : 1,
                ThuTu = item.ThuTu > 0 ? item.ThuTu : i,
            });
        }

        await Task.CompletedTask;
    }

    private async Task SyncBomItemsAsync(
        int maSanPham,
        int maDanhMuc,
        List<ProductBomInputDto> bomItems,
        CancellationToken ct)
    {
        if (await IsComboCategoryAsync(maDanhMuc, ct))
            return;

        foreach (var item in bomItems.Where(x => x.MaNguyenLieu > 0 && x.SoLuong > 0))
        {
            _context.CongThucSanPhams.Add(new CongThucSanPham
            {
                MaSanPham = maSanPham,
                MaNguyenLieu = item.MaNguyenLieu,
                SoLuong = item.SoLuong,
                DonVi = item.DonVi.Trim(),
                GhiChu = item.GhiChu?.Trim(),
            });
        }

        await Task.CompletedTask;
    }

    private async Task<string?> ValidateBomItemsAsync(
        int maDanhMuc,
        List<ProductBomInputDto> bomItems,
        CancellationToken ct)
    {
        if (await IsComboCategoryAsync(maDanhMuc, ct) || bomItems.Count == 0)
            return null;

        var validLines = bomItems
            .Where(x => x.MaNguyenLieu > 0 && x.SoLuong > 0)
            .ToList();

        if (validLines.Count == 0)
            return null;

        if (validLines.Any(x => string.IsNullOrWhiteSpace(x.DonVi)))
            return "Đơn vị nguyên liệu trong công thức không được để trống.";

        var materialIds = validLines.Select(x => x.MaNguyenLieu).Distinct().ToList();
        var materials = await _context.NguyenLieus.AsNoTracking()
            .Where(x => materialIds.Contains(x.MaNguyenLieu) && x.TrangThai)
            .Select(x => new { x.MaNguyenLieu, x.DonVi })
            .ToListAsync(ct);

        if (materials.Count != materialIds.Count)
            return "Có nguyên liệu trong công thức không tồn tại hoặc đã ngưng.";

        return null;
    }

    private async Task<string?> ValidateComboItemsBusinessAsync(
        int maDanhMuc,
        List<ComboChiTietInputDto> comboItems,
        int? excludeComboId,
        CancellationToken ct)
    {
        var isCombo = await IsComboCategoryAsync(maDanhMuc, ct);

        if (ProductRules.ValidateComboForCategory(isCombo, comboItems) is { } categoryError)
            return categoryError;

        if (!isCombo || comboItems.Count == 0)
            return null;

        var comboCategoryId = await GetComboCategoryIdAsync(ct);
        var childIds = comboItems.Select(x => x.MaSanPhamCon).Distinct().ToList();
        var children = await _context.SanPhams.AsNoTracking()
            .Where(s => childIds.Contains(s.MaSanPham))
            .Select(s => new { s.MaSanPham, s.MaDanhMuc })
            .ToListAsync(ct);

        if (children.Count != childIds.Count)
            return "Có món con không tồn tại.";

        if (comboCategoryId is > 0 && children.Any(c => c.MaDanhMuc == comboCategoryId))
            return "Combo không được chứa combo khác.";

        return null;
    }

    private Task<bool> IsComboCategoryAsync(int maDanhMuc, CancellationToken ct)
        => _context.DanhMucs.AnyAsync(d => d.MaDanhMuc == maDanhMuc && d.TenDanhMuc == "Combo", ct);

    private Task<int?> GetComboCategoryIdAsync(CancellationToken ct)
        => _context.DanhMucs
            .Where(d => d.TenDanhMuc == "Combo")
            .Select(d => (int?)d.MaDanhMuc)
            .FirstOrDefaultAsync(ct);
}
