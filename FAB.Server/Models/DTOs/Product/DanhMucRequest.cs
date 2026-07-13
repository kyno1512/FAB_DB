namespace FAB.Server.Models.DTOs;

public class DanhMucRequest
{
    public string TenDanhMuc { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string? HinhAnh { get; set; }
    public int ThuTu { get; set; }
    public bool TrangThai { get; set; } = true;
    public bool CoSize { get; set; } = true;
}
