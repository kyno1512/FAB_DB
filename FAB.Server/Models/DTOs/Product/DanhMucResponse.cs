namespace FAB.Server.Models.DTOs;

public class DanhMucResponse
{
    public int MaDanhMuc { get; set; }
    public string TenDanhMuc { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string? HinhAnh { get; set; }
    public int ThuTu { get; set; }
    public bool TrangThai { get; set; }
    public bool CoSize { get; set; } = true;
    public int SoSanPham { get; set; }
}
