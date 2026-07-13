namespace FAB.Server.Models.DTOs;

public class CreateVnpayPaymentRequest
{
    public decimal Amount { get; set; }
    public string? OrderInfo { get; set; }
    public int? MaDonHang { get; set; }
}
