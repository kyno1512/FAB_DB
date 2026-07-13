namespace FAB.Server.Models.DTOs;

public class ProductBomInputDto
{
    public int MaNguyenLieu { get; set; }
    public decimal SoLuong { get; set; }
    public string DonVi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
}

public class ProductBomDto
{
    public int MaCongThuc { get; set; }
    public int MaNguyenLieu { get; set; }
    public string TenNguyenLieu { get; set; } = string.Empty;
    public decimal SoLuong { get; set; }
    public string DonVi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public decimal SoLuongTon { get; set; }
}
