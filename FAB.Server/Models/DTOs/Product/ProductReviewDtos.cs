namespace FAB.Server.Models.DTOs;

public class ProductReviewItemDto
{
    public int MaDanhGia { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public int Diem { get; set; }
    public string NoiDung { get; set; } = string.Empty;
    public DateTime NgayTao { get; set; }
}

public class ProductReviewPageDto
{
    public List<ProductReviewItemDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public double DiemTrungBinh { get; set; }
    public int TongDanhGia { get; set; }
}

public class CreateProductReviewRequest
{
    public string? HoTen { get; set; }
    public int Diem { get; set; }
    public string NoiDung { get; set; } = string.Empty;
}
