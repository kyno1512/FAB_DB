namespace FAB.Server.Models.DTOs;

public class ComboChiTietInputDto
{
    public int MaSanPhamCon { get; set; }
    public int SoLuong { get; set; } = 1;
    public int ThuTu { get; set; }
}

public class ComboChiTietDto
{
    public int MaSanPhamCon { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string TenDanhMuc { get; set; } = string.Empty;
    public decimal GiaBan { get; set; }
    public int SoLuong { get; set; }
    public int ThuTu { get; set; }
    public string? HinhAnhChinh { get; set; }
}
