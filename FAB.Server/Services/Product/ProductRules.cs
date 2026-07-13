using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Product;

internal static class ProductRules
{
    public static string? ValidateDanhMuc(DanhMucRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TenDanhMuc))
            return "Tên danh mục không được để trống.";

        if (request.TenDanhMuc.Trim().Length > 150)
            return "Tên danh mục tối đa 150 ký tự.";

        return null;
    }

    public static string? ValidateSanPhamCreate(SanPhamCreateRequest request)
    {
        if (ValidateBasicFields(request) is { } error)
            return error;

        return ValidateComboItems(null, request.ComboItems);
    }

    public static string? ValidateSanPhamUpdate(SanPhamUpdateRequest request, int comboId)
    {
        if (ValidateBasicFields(request) is { } error)
            return error;

        return ValidateComboItems(comboId, request.ComboItems);
    }

    private static string? ValidateBasicFields(SanPhamCreateRequest request)
    {
        if (request.MaDanhMuc <= 0)
            return "Danh mục không hợp lệ.";

        if (string.IsNullOrWhiteSpace(request.TenSanPham))
            return "Tên sản phẩm không được để trống.";

        if (request.TenSanPham.Trim().Length > 200)
            return "Tên sản phẩm tối đa 200 ký tự.";

        if (request.GiaBan <= 0)
            return "Giá bán phải lớn hơn 0.";

        if (request.GiaGoc is < 0)
            return "Giá gốc không hợp lệ.";

        return null;
    }

    public static string? ValidateComboItems(int? excludeComboId, List<ComboChiTietInputDto> comboItems)
    {
        if (comboItems.Count == 0)
            return null;

        if (comboItems.Any(x => x.MaSanPhamCon <= 0))
            return "Món con trong combo không hợp lệ.";

        if (comboItems.Any(x => x.SoLuong < 1))
            return "Số lượng món con phải >= 1.";

        if (excludeComboId is > 0 && comboItems.Any(x => x.MaSanPhamCon == excludeComboId))
            return "Combo không thể chứa chính nó.";

        var distinct = comboItems.Select(x => x.MaSanPhamCon).Distinct().Count();
        if (distinct != comboItems.Count)
            return "Không được chọn trùng món con trong combo.";

        return null;
    }

    public static string? ValidateComboForCategory(bool isComboCategory, List<ComboChiTietInputDto> comboItems)
    {
        if (isComboCategory)
        {
            if (comboItems.Count < 2)
                return "Combo cần chọn ít nhất 2 món con.";
            return null;
        }

        if (comboItems.Count > 0)
            return "Chỉ danh mục Combo mới được chọn món con.";

        return null;
    }
}
