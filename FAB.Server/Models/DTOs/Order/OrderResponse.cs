namespace FAB.Server.Models.DTOs;

public class OrderResponse
{
    public int MaDonHang { get; set; }
    public int MaHoaDon { get; set; }
    public string SoHoaDon { get; set; } = string.Empty;
    public decimal TongThanhToan { get; set; }
    public string? TrackingToken { get; set; }
    public bool EmailSent { get; set; }
}
