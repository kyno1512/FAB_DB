using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using Microsoft.AspNetCore.Http;

namespace FAB.Server.Services.Payment;

/// <summary>
/// Tích hợp cổng thanh toán VNPay (redirect + IPN callback).
/// </summary>
public interface IVnpayService
{
    // Bước 1: Tạo URL redirect sang trang VNPay
    Task<ServiceResult<VnpayPaymentResponse>> CreatePaymentUrlAsync(
        CreateVnpayPaymentRequest request,
        string clientIp,
        CancellationToken ct = default);

    // Bước 2: VNPay gọi IPN (server → server), verify chữ ký và cập nhật DB
    Task<VnpayIpnResponse> ProcessIpnAsync(IQueryCollection query, CancellationToken ct = default);

    // Bước 3: Khách quay lại ReturnUrl — verify chữ ký trước khi hiển thị kết quả
    bool TryValidateReturn(IQueryCollection query, out Dictionary<string, string> data);

    // Admin: Xác nhận thanh toán VNPay thủ công (khi khách đã trả nhưng IPN không hoạt động)
    Task<ServiceResult> ConfirmManualPaymentAsync(int maDonHang, CancellationToken ct = default);

    // Gửi email xác nhận đơn hàng (dùng khi redirect về return URL)
    Task SendConfirmationEmailAsync(int maDonHang, CancellationToken ct = default);
}
