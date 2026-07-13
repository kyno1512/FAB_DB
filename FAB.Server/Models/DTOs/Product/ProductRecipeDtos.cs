namespace FAB.Server.Models.DTOs;

public class ProductRecipeListItemDto
{
    public int MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string TenDanhMuc { get; set; } = string.Empty;
    public bool TrangThai { get; set; }
    public string? HinhAnhChinh { get; set; }
    public int SoDongCongThuc { get; set; }
    public bool CoCongThuc { get; set; }
    public int SoLuongCoTheBan { get; set; }
}

public class ProductRecipeDetailDto
{
    public int MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string TenDanhMuc { get; set; } = string.Empty;
    public List<ProductBomDto> BomItems { get; set; } = [];
}

public class UpdateProductRecipeRequest
{
    public List<ProductBomInputDto> BomItems { get; set; } = [];
}

public class ProductRecipeStatsDto
{
    public int TongMon { get; set; }
    public int DaCoCongThuc { get; set; }
    public int ChuaCoCongThuc { get; set; }
}
