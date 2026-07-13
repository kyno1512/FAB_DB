namespace FAB.Server.Options;

/// <summary>
/// Cấu hình VNPay Sandbox/Production.
/// TmnCode + HashSecret để trống trong appsettings.json, điền trong User Secrets (Manage User Secrets).
/// </summary>
public class VnpayOptions
{
    public const string SectionName = "Vnpay";

    // Terminal ID — email VNPay gửi sau khi đăng ký sandbox (vnp_TmnCode)
    public string TmnCode { get; set; } = string.Empty;

    // Secret Key — KHÔNG commit lên git, chỉ lưu User Secrets (vnp_HashSecret)
    public string HashSecret { get; set; } = string.Empty;

    // URL trang thanh toán VNPay (sandbox hoặc production)
    public string PaymentUrl { get; set; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    // FE hiển thị kết quả thanh toán cho khách
    public string ReturnUrl { get; set; } = "http://localhost:5174/thanh-toan/ket-qua";

    // BE nhận redirect từ VNPay, verify chữ ký rồi chuyển sang ReturnUrl
    public string CallbackReturnUrl { get; set; } = "http://localhost:5136/api/payments/vnpay/return";

    // URL public (ngrok khi dev) — VNPay gọi server-to-server cập nhật trạng thái
    public string IpnUrl { get; set; } = string.Empty;

    public string Version { get; set; } = "2.1.0";
    public string Command { get; set; } = "pay";
    public string CurrCode { get; set; } = "VND";
    public string Locale { get; set; } = "vn";
    public string OrderType { get; set; } = "other";
    public int ExpireMinutes { get; set; } = 15;
}
