namespace FAB.Server.Models.DTOs;

public class HinhAnhSanPhamDto
{
    public int? MaHinhAnh { get; set; }
    public string DuongDan { get; set; } = string.Empty;
    public bool LaAnhChinh { get; set; }
    public int ThuTu { get; set; }
}
