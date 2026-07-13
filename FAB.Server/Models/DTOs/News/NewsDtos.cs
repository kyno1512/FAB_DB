namespace FAB.Server.Models.DTOs.News;

public class NewsPostDto
{
    public int MaTinTuc { get; set; }
    public string TieuDe { get; set; } = string.Empty;
    public string DanhMuc { get; set; } = string.Empty;
    public string TomTat { get; set; } = string.Empty;
    public string? NoiDung { get; set; }
    public string? AnhDaiDien { get; set; }
    public List<string>? AnhPhu { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public DateTime NgayDang { get; set; }
    public DateTime NgayTao { get; set; }
    public DateTime? NgayCapNhat { get; set; }
}

public class UpsertNewsRequest
{
    public string TieuDe { get; set; } = string.Empty;
    public string DanhMuc { get; set; } = string.Empty;
    public string TomTat { get; set; } = string.Empty;
    public string? NoiDung { get; set; }
    public string? AnhDaiDien { get; set; }
    public List<string>? AnhPhu { get; set; }
    public string TrangThai { get; set; } = "Nhap";
    public DateTime? NgayDang { get; set; }
}
