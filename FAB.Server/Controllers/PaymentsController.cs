using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Models.DTOs.Payment;
using FAB.Server.Options;
using FAB.Server.Services.Auth;
using FAB.Server.Services.Payment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace FAB.Server.Controllers;

/// <summary>
/// API thanh toán VNPay (public — FE gọi create, VNPay gọi ipn/return).
/// </summary>
[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IVnpayService _vnpayService;
    private readonly VnpayOptions _options;
    private readonly IMemoryCache _cache;
    private const string CachePrefix = "vnpay:";

    public PaymentsController(
        IVnpayService vnpayService,
        IOptions<VnpayOptions> options,
        IMemoryCache cache)
    {
        _vnpayService = vnpayService;
        _options = options.Value;
        _cache = cache;
    }

    private const string ReturnCachePrefix = "vnpay_return:";

    // POST /api/payments/vnpay/create — FE gửi amount hoặc maDonHang, nhận paymentUrl
    [HttpPost("vnpay/create")]
    public async Task<IActionResult> CreateVnpayPayment(
        [FromBody] CreateVnpayPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var clientIp = HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";
        var result = await _vnpayService.CreatePaymentUrlAsync(request, clientIp, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    // GET /api/payments/vnpay/ipn — VNPay server gọi (cần URL public: ngrok)
    [HttpGet("vnpay/ipn")]
    public async Task<IActionResult> VnpayIpn(CancellationToken cancellationToken)
    {
        var response = await _vnpayService.ProcessIpnAsync(Request.Query, cancellationToken);
        return Ok(response);
    }

    // GET /api/payments/vnpay/return — VNPay redirect khách về, chuyển tiếp sang FE
    [HttpGet("vnpay/return")]
    public async Task<IActionResult> VnpayReturn(CancellationToken ct)
    {
        if (!_vnpayService.TryValidateReturn(Request.Query, out var data))
        {
            return Redirect($"{_options.ReturnUrl}?success=false&code=97");
        }

        var responseCode = data.GetValueOrDefault("vnp_ResponseCode");
        var transactionStatus = data.GetValueOrDefault("vnp_TransactionStatus");
        var txnRef = data.GetValueOrDefault("vnp_TxnRef");
        var isSuccess = responseCode == "00" && transactionStatus == "00";

        // Gửi email ngay khi thanh toán thành công (trước IPN)
        if (isSuccess && !string.IsNullOrEmpty(txnRef))
        {
            var cacheKey = ReturnCachePrefix + txnRef;
            if (_cache.TryGetValue<int?>(cacheKey, out var maDonHang) && maDonHang.HasValue)
            {
                try
                {
                    await _vnpayService.SendConfirmationEmailAsync(maDonHang.Value, ct);
                }
                catch (Exception)
                {
                    // Log but don't block redirect
                }
                _cache.Remove(cacheKey);
            }
        }

        var qs = QueryString.Create(new Dictionary<string, string?>
        {
            ["success"] = isSuccess ? "true" : "false",
            ["code"] = responseCode ?? "",
            ["txnRef"] = txnRef ?? "",
        });

        return Redirect($"{_options.ReturnUrl}{qs}");
    }

    // POST /api/payments/vnpay/confirm-manual — Admin xác nhận thanh toán VNPay thủ công
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPost("vnpay/confirm-manual")]
    public async Task<IActionResult> ConfirmManualPayment(
        [FromBody] ConfirmManualPaymentRequest request,
        CancellationToken ct)
    {
        var result = await _vnpayService.ConfirmManualPaymentAsync(request.MaDonHang, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = $"Đã xác nhận thanh toán cho đơn #{request.MaDonHang}." });
    }
}
