namespace FAB.Server.Models.DTOs;

public class ProductSearchTagDto
{
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
    public int? MaDanhMuc { get; set; }
    public string? Search { get; set; }
}
