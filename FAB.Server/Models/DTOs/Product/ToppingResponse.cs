namespace FAB.Server.Models.DTOs;

public class ToppingResponse
{
    public int MaTopping { get; set; }
    public string TenTopping { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public bool TrangThai { get; set; }
}
