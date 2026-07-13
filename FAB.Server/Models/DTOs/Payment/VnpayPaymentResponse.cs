namespace FAB.Server.Models.DTOs;

public class VnpayPaymentResponse
{
    public string PaymentUrl { get; set; } = string.Empty;
    public string TxnRef { get; set; } = string.Empty;
}
