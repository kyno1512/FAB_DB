namespace FAB.Server.Models;

public partial class TinTuc
{
    public int MaTinTuc { get; set; }

    public string TieuDe { get; set; } = string.Empty;

    public string DanhMuc { get; set; } = string.Empty;

    public string TomTat { get; set; } = string.Empty;

    public string? NoiDung { get; set; }

    public string? AnhDaiDien { get; set; }

    /// <summary>JSON array of extra image URLs (excluding cover).</summary>
    public string? AnhPhu { get; set; }

    public string TrangThai { get; set; } = "Nhap";

    public DateTime NgayDang { get; set; }

    public DateTime NgayTao { get; set; }

    public DateTime? NgayCapNhat { get; set; }
}
