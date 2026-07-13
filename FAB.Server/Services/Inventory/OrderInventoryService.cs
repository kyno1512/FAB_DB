using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Inventory;

public class OrderInventoryService : IOrderInventoryService
{
    private readonly FabDbContext _context;

    public OrderInventoryService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult> ValidateOrderLinesAsync(
        IReadOnlyList<OrderInventoryLine> lines,
        CancellationToken ct = default)
    {
        try
        {
            var required = await CalculateRequiredMaterialsAsync(lines, ct);
            return await ValidateRequiredAsync(required, ct);
        }
        catch (ProductWithoutRecipeException ex)
        {
            return ServiceResult.Fail(ex.Message);
        }
    }

    public async Task<ServiceResult> CheckStockAsync(
        IReadOnlyList<OrderInventoryLine> lines,
        CancellationToken ct = default)
    {
        if (lines.Count == 0)
            return ServiceResult.Ok(string.Empty);

        try
        {
            var required = await CalculateRequiredMaterialsAsync(lines, ct);
            return await ValidateRequiredAsync(required, ct);
        }
        catch (ProductWithoutRecipeException ex)
        {
            return ServiceResult.Fail(ex.Message);
        }
    }

    public async Task<int> GetMaxAvailableAsync(int maSanPham, CancellationToken ct = default)
    {
        var batch = await GetMaxAvailableBatchAsync(new[] { maSanPham }, ct);
        return batch.TryGetValue(maSanPham, out var result) ? result : 0;
    }

    public async Task<ServiceResult> DeductForOrderAsync(
        int maDonHang,
        int? nguoiThucHien = null,
        CancellationToken ct = default)
    {
        if (await HasDeductedForOrderAsync(maDonHang, ct))
            return ServiceResult.Ok(string.Empty);

        var lines = await LoadOrderLinesAsync(maDonHang, ct);
        if (lines.Count == 0)
            return ServiceResult.Ok(string.Empty);

        try
        {
            var required = await CalculateRequiredMaterialsAsync(lines, ct);
            var validation = await ValidateRequiredAsync(required, ct);
            if (!validation.Success)
                return validation;

            await ApplyStockChangeAsync(required, maDonHang, deduct: true, nguoiThucHien, ct);
            await _context.SaveChangesAsync(ct);
        }
        catch (ProductWithoutRecipeException ex)
        {
            return ServiceResult.Fail(ex.Message);
        }
        catch (Exception ex)
        {
            return ServiceResult.Fail($"Lỗi trừ kho: {ex.Message}");
        }

        return ServiceResult.Ok(string.Empty);
    }

    public async Task<ServiceResult> RestoreForOrderAsync(
        int maDonHang,
        int? nguoiThucHien = null,
        CancellationToken ct = default)
    {
        if (!await HasDeductedForOrderAsync(maDonHang, ct))
            return ServiceResult.Ok(string.Empty);

        var prefix = OrderNotePrefix(maDonHang);
        var history = await _context.LichSuTonKhos
            .Where(x => x.LoaiThayDoi == "Xuat" && x.GhiChu != null && x.GhiChu.StartsWith(prefix))
            .ToListAsync(ct);

        if (history.Count == 0)
            return ServiceResult.Ok(string.Empty);

        var materialIds = history.Select(x => x.MaNguyenLieu).Distinct().ToList();
        var materials = await _context.NguyenLieus
            .Where(x => materialIds.Contains(x.MaNguyenLieu))
            .ToDictionaryAsync(x => x.MaNguyenLieu, ct);

        var now = DateTime.Now;
        foreach (var entry in history)
        {
            if (!materials.TryGetValue(entry.MaNguyenLieu, out var item))
                continue;

            var qty = Math.Abs(entry.SoLuongThayDoi);
            var before = item.SoLuongTon;
            item.SoLuongTon = before + qty;

            _context.LichSuTonKhos.Add(new LichSuTonKho
            {
                MaNguyenLieu = item.MaNguyenLieu,
                LoaiThayDoi = "HoanTra",
                SoLuongThayDoi = qty,
                SoLuongTruoc = before,
                SoLuongSau = item.SoLuongTon,
                GhiChu = $"Hoàn trả {prefix}",
                NguoiThucHien = nguoiThucHien,
                NgayGhiNhan = now,
            });
        }

        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok(string.Empty);
    }

    public Task<bool> HasDeductedForOrderAsync(int maDonHang, CancellationToken ct = default)
    {
        var prefix = OrderNotePrefix(maDonHang);
        return _context.LichSuTonKhos.AnyAsync(
            x => x.LoaiThayDoi == "Xuat" && x.GhiChu != null && x.GhiChu.StartsWith(prefix),
            ct);
    }

    private async Task<List<OrderInventoryLine>> LoadOrderLinesAsync(int maDonHang, CancellationToken ct)
    {
        return await _context.ChiTietDonHangs
            .AsNoTracking()
            .Where(x => x.MaDonHang == maDonHang)
            .Select(x => new OrderInventoryLine(x.MaSanPham, x.SoLuong))
            .ToListAsync(ct);
    }

    private async Task<Dictionary<int, decimal>> CalculateRequiredMaterialsAsync(
        IReadOnlyList<OrderInventoryLine> lines,
        CancellationToken ct)
    {
        if (lines.Count == 0)
            return [];

        var productUnits = ExpandProductUnits(lines);
        if (productUnits.Count == 0)
            return [];

        var productIds = productUnits.Keys.ToList();

        var recipes = await _context.CongThucSanPhams
            .AsNoTracking()
            .Where(x => productIds.Contains(x.MaSanPham))
            .ToListAsync(ct);

        var productsWithRecipe = recipes.Select(r => r.MaSanPham).Distinct().ToHashSet();
        var productsWithoutRecipe = productIds.Where(id => !productsWithRecipe.Contains(id)).ToList();

        if (productsWithoutRecipe.Count > 0)
        {
            var names = await _context.SanPhams
                .AsNoTracking()
                .Where(x => productsWithoutRecipe.Contains(x.MaSanPham))
                .Select(x => x.TenSanPham)
                .ToListAsync(ct);

            var namesList = string.Join(", ", names);
            throw new ProductWithoutRecipeException(
                $"Sản phẩm chưa có công thức: {namesList}. Vui lòng khai báo định mức nguyên liệu trước khi bán.",
                names);
        }

        var required = new Dictionary<int, decimal>();
        foreach (var (maSanPham, qty) in productUnits)
        {
            foreach (var recipe in recipes.Where(r => r.MaSanPham == maSanPham))
            {
                required[recipe.MaNguyenLieu] =
                    required.GetValueOrDefault(recipe.MaNguyenLieu) + recipe.SoLuong * qty;
            }
        }

        return required;
    }

    private Dictionary<int, int> ExpandProductUnits(IReadOnlyList<OrderInventoryLine> lines)
    {
        var comboIds = lines.Select(x => x.MaSanPham).Distinct().ToList();
        var comboChildren = _context.ComboChiTiets
            .AsNoTracking()
            .Where(x => comboIds.Contains(x.MaCombo))
            .ToList()
            .GroupBy(x => x.MaCombo)
            .ToDictionary(g => g.Key, g => g.ToList());

        var productUnits = new Dictionary<int, int>();
        foreach (var line in lines)
        {
            if (comboChildren.TryGetValue(line.MaSanPham, out var children) && children.Count > 0)
            {
                foreach (var child in children)
                    AddUnits(productUnits, child.MaSanPhamCon, child.SoLuong * line.SoLuong);
            }
            else
            {
                AddUnits(productUnits, line.MaSanPham, line.SoLuong);
            }
        }

        return productUnits;
    }

    private static void AddUnits(Dictionary<int, int> productUnits, int maSanPham, int qty)
    {
        if (qty <= 0) return;
        productUnits[maSanPham] = productUnits.GetValueOrDefault(maSanPham) + qty;
    }

    private async Task<ServiceResult> ValidateRequiredAsync(
        Dictionary<int, decimal> required,
        CancellationToken ct)
    {
        if (required.Count == 0)
            return ServiceResult.Ok(string.Empty);

        var materialIds = required.Keys.ToList();
        var materials = await _context.NguyenLieus
            .AsNoTracking()
            .Where(x => materialIds.Contains(x.MaNguyenLieu) && x.TrangThai)
            .ToDictionaryAsync(x => x.MaNguyenLieu, ct);

        foreach (var (maNguyenLieu, need) in required)
        {
            if (!materials.TryGetValue(maNguyenLieu, out var item))
                return ServiceResult.Fail("Có nguyên liệu trong công thức không còn hoạt động.");

            if (item.SoLuongTon < need)
            {
                var maxAvail = (int)Math.Floor(item.SoLuongTon / need);
                return ServiceResult.Fail(
                    $"Tồn kho không đủ để chuẩn bị thêm.",
                    bottleneckIngredient: item.TenNguyenLieu,
                    maxAvailable: maxAvail);
            }
        }

        return ServiceResult.Ok(string.Empty);
    }

    private async Task ApplyStockChangeAsync(
        Dictionary<int, decimal> required,
        int maDonHang,
        bool deduct,
        int? nguoiThucHien,
        CancellationToken ct)
    {
        if (required.Count == 0)
            return;

        var materialIds = required.Keys.ToList();
        var materials = await _context.NguyenLieus
            .Where(x => materialIds.Contains(x.MaNguyenLieu))
            .ToDictionaryAsync(x => x.MaNguyenLieu, ct);

        var now = DateTime.Now;
        var note = OrderNotePrefix(maDonHang);

        foreach (var (maNguyenLieu, qty) in required)
        {
            if (!materials.TryGetValue(maNguyenLieu, out var item))
                continue;

            var before = item.SoLuongTon;
            item.SoLuongTon = deduct ? before - qty : before + qty;

            _context.LichSuTonKhos.Add(new LichSuTonKho
            {
                MaNguyenLieu = item.MaNguyenLieu,
                LoaiThayDoi = deduct ? "Xuat" : "HoanTra",
                SoLuongThayDoi = deduct ? -qty : qty,
                SoLuongTruoc = before,
                SoLuongSau = item.SoLuongTon,
                GhiChu = note,
                NguoiThucHien = nguoiThucHien,
                NgayGhiNhan = now,
            });
        }
    }

    private static string OrderNotePrefix(int maDonHang) => $"Đơn hàng #{maDonHang}";

    private static string FormatQty(decimal value)
        => value % 1 == 0 ? ((int)value).ToString() : value.ToString("0.##");

    public async Task<Dictionary<int, int>> GetMaxAvailableBatchAsync(
        IReadOnlyList<int> maSanPhams,
        CancellationToken ct = default)
    {
        var result = new Dictionary<int, int>();

        if (maSanPhams.Count == 0)
            return result;

        var unique = maSanPhams.Distinct().ToList();

        // Load combo children for all products
        var comboChildren = await _context.ComboChiTiets
            .AsNoTracking()
            .Where(x => unique.Contains(x.MaCombo))
            .ToListAsync(ct);

        var comboChildMap = comboChildren
            .GroupBy(x => x.MaCombo)
            .ToDictionary(g => g.Key, g => g.ToList());

        // Separate combo products and regular products
        var comboProductIds = comboChildMap.Keys.ToList();
        var regularProductIds = unique.Where(id => !comboProductIds.Contains(id)).ToList();

        // Get recipes for all relevant products (regular + combo children)
        var allRelevantIds = regularProductIds.Concat(comboChildren.Select(c => c.MaSanPhamCon)).Distinct().ToList();

        var recipes = await _context.CongThucSanPhams
            .AsNoTracking()
            .Where(x => allRelevantIds.Contains(x.MaSanPham))
            .ToListAsync(ct);

        var productsWithRecipe = recipes.Select(r => r.MaSanPham).Distinct().ToHashSet();

        // Products without recipe -> 0
        foreach (var id in regularProductIds.Where(x => !productsWithRecipe.Contains(x)))
            result[id] = 0;

        var materialIds = recipes.Select(r => r.MaNguyenLieu).Distinct().ToList();
        var materials = await _context.NguyenLieus
            .AsNoTracking()
            .Where(x => materialIds.Contains(x.MaNguyenLieu) && x.TrangThai)
            .ToDictionaryAsync(x => x.MaNguyenLieu, ct);

        var recipesByProduct = recipes
            .GroupBy(r => r.MaSanPham)
            .ToDictionary(g => g.Key, g => g.ToList());

        // Calculate max available for regular products
        foreach (var maSanPham in regularProductIds)
        {
            if (!recipesByProduct.TryGetValue(maSanPham, out var productRecipes) ||
                productRecipes.Count == 0)
            {
                continue;
            }

            var minAvailable = CalculateMaxForProduct(maSanPham, productRecipes, materials);
            result[maSanPham] = minAvailable;
        }

        // Calculate max available for combo products
        foreach (var maCombo in comboProductIds)
        {
            if (!comboChildMap.TryGetValue(maCombo, out var children) || children.Count == 0)
            {
                result[maCombo] = 0;
                continue;
            }

            // For each child, calculate max available
            var childMaxAvailables = new List<int>();
            foreach (var child in children)
            {
                if (!recipesByProduct.TryGetValue(child.MaSanPhamCon, out var childRecipes) ||
                    childRecipes.Count == 0)
                {
                    childMaxAvailables.Add(0);
                    continue;
                }

                var childMax = CalculateMaxForProduct(child.MaSanPhamCon, childRecipes, materials);
                // Adjust for quantity in combo
                var adjusted = childMax / child.SoLuong;
                childMaxAvailables.Add(adjusted);
            }

            // Combo max = min of all children's max available
            result[maCombo] = childMaxAvailables.Count > 0 ? childMaxAvailables.Min() : 0;
        }

        return result;
    }

    private int CalculateMaxForProduct(
        int maSanPham,
        List<CongThucSanPham> productRecipes,
        Dictionary<int, NguyenLieu> materials)
    {
        int minAvailable = int.MaxValue;
        bool hasPositiveRecipe = false;

        foreach (var recipe in productRecipes)
        {
            if (!materials.TryGetValue(recipe.MaNguyenLieu, out var material))
            {
                return 0;
            }

            var perUnit = recipe.SoLuong;
            if (perUnit <= 0)
                continue;

            hasPositiveRecipe = true;
            var available = (int)Math.Floor(material.SoLuongTon / perUnit);
            if (available < minAvailable)
                minAvailable = available;
        }

        if (!hasPositiveRecipe)
            return 0;

        return minAvailable == int.MaxValue ? int.MaxValue : minAvailable;
    }
}
