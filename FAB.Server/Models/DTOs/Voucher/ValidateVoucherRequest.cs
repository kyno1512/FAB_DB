namespace FAB.Server.Models.DTOs.Voucher;

public class ValidateVoucherRequest
{
    public string MaCode { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public string? Email { get; set; }
}
