namespace FAB.Server.Models.DTOs;

public class SanPhamToppingDto
{
    public int MaTopping { get; set; }
    public string TenTopping { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public decimal GiaThem { get; set; }
}
