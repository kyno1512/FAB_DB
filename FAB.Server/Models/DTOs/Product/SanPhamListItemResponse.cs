namespace FAB.Server.Models.DTOs;

public class SanPhamListItemResponse
{
    public int MaSanPham { get; set; }
    public int MaDanhMuc { get; set; }
    public string TenDanhMuc { get; set; } = string.Empty;
    public string TenSanPham { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public decimal GiaBan { get; set; }
    public decimal? GiaGoc { get; set; }
    public string? DonVi { get; set; }
    public bool TrangThai { get; set; }
    public DateTime NgayTao { get; set; }
    public string? HinhAnhChinh { get; set; }
    public int SoLuongBan { get; set; }
    public bool ConHang { get; set; }
    public int CoTheBan { get; set; }
}
