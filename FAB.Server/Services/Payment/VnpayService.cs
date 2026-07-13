using System.Collections.Specialized;
using System.Globalization;
using System.Text.RegularExpressions;
using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using FAB.Server.Options;
using FAB.Server.Services.Inventory;
using FAB.Server.Services.Order;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace FAB.Server.Services.Payment;

/// <summary>
/// Xử lý thanh toán VNPay: tạo URL, nhận IPN, cập nhật bảng ThanhToan khi có maDonHang.
/// Config đọc từ VnpayOptions (User Secrets override appsettings).
/// </summary>
public partial class VnpayService : IVnpayService
{
    // Lưu tạm giao dịch chờ IPN (chưa có đơn hàng vẫn test được bằng amount)
    private const string CachePrefix = "vnpay:txn:";

    private readonly VnpayOptions _options;
    private readonly FabDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly IOrderInventoryService _orderInventoryService;
    private readonly IOrderConfirmationEmailService _orderConfirmationEmailService;
    private readonly ILogger<VnpayService> _logger;

    public VnpayService(
        IOptions<VnpayOptions> options,
        FabDbContext context,
        IMemoryCache cache,
        IOrderInventoryService orderInventoryService,
        IOrderConfirmationEmailService orderConfirmationEmailService,
        ILogger<VnpayService> logger)
    {
        _options = options.Value;
        _context = context;
        _cache = cache;
        _orderInventoryService = orderInventoryService;
        _orderConfirmationEmailService = orderConfirmationEmailService;
        _logger = logger;
    }

    public async Task<ServiceResult<VnpayPaymentResponse>> CreatePaymentUrlAsync(
        CreateVnpayPaymentRequest request,
        string clientIp,
        CancellationToken ct = default)
    {
        // Key đọc từ User Secrets — appsettings.json cố ý để trống
        if (string.IsNullOrWhiteSpace(_options.TmnCode) || string.IsNullOrWhiteSpace(_options.HashSecret))
            return ServiceResult<VnpayPaymentResponse>.Fail("Chưa cấu hình VNPay. Thêm TmnCode và HashSecret vào User Secrets.");

        decimal amount = request.Amount;
        string orderInfo = request.OrderInfo ?? "Thanh toan don hang Flygo";

        if (request.MaDonHang.HasValue)
        {
            var order = await _context.DonHangs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaDonHang == request.MaDonHang.Value, ct);

            if (order is null)
                return ServiceResult<VnpayPaymentResponse>.Fail("Đơn hàng không tồn tại.");

            amount = order.TongThanhToan;
            orderInfo = request.OrderInfo ?? $"Thanh toan don hang {order.MaDonHang}";
        }

        if (amount <= 0)
            return ServiceResult<VnpayPaymentResponse>.Fail("Số tiền thanh toán không hợp lệ.");

        var now = GetVietnamNow();
        var txnRef = request.MaDonHang.HasValue
            ? $"DH{request.MaDonHang.Value}{now:yyyyMMddHHmmss}"
            : $"TEST{now:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}";

        orderInfo = NormalizeOrderInfo(orderInfo);

        var vnpData = new Dictionary<string, string>
        {
            ["vnp_Version"] = _options.Version,
            ["vnp_Command"] = _options.Command,
            ["vnp_TmnCode"] = _options.TmnCode,
            // VNPay: số tiền × 100 (120.000đ → 12000000)
            ["vnp_Amount"] = ((long)(amount * 100)).ToString(CultureInfo.InvariantCulture),
            ["vnp_CreateDate"] = now.ToString("yyyyMMddHHmmss"),
            ["vnp_CurrCode"] = _options.CurrCode,
            ["vnp_IpAddr"] = string.IsNullOrWhiteSpace(clientIp) ? "127.0.0.1" : clientIp,
            ["vnp_Locale"] = _options.Locale,
            ["vnp_OrderInfo"] = orderInfo,
            ["vnp_OrderType"] = _options.OrderType,
            ["vnp_ReturnUrl"] = string.IsNullOrWhiteSpace(_options.CallbackReturnUrl)
                ? _options.ReturnUrl
                : _options.CallbackReturnUrl,
            ["vnp_TxnRef"] = txnRef,
            ["vnp_ExpireDate"] = now.AddMinutes(_options.ExpireMinutes).ToString("yyyyMMddHHmmss"),
        };

        if (!string.IsNullOrWhiteSpace(_options.IpnUrl))
            vnpData["vnp_IpnUrl"] = _options.IpnUrl;

        var paymentUrl = VnpayLibrary.CreatePaymentUrl(
            _options.PaymentUrl,
            _options.HashSecret,
            vnpData);

        _cache.Set(
            CachePrefix + txnRef,
            new PendingVnpayPayment(amount, request.MaDonHang, false),
            TimeSpan.FromMinutes(_options.ExpireMinutes + 5));

        // Lưu cache riêng cho return URL (để gửi email khi redirect về)
        if (request.MaDonHang.HasValue)
        {
            _cache.Set(
                "vnpay_return:" + txnRef,
                request.MaDonHang.Value,
                TimeSpan.FromMinutes(_options.ExpireMinutes + 30));
        }

        return ServiceResult<VnpayPaymentResponse>.Ok(new VnpayPaymentResponse
        {
            PaymentUrl = paymentUrl,
            TxnRef = txnRef,
        });
    }

    // VNPay gọi GET tới IpnUrl — phải trả RspCode 00/02/97... theo tài liệu
    public async Task<VnpayIpnResponse> ProcessIpnAsync(IQueryCollection query, CancellationToken ct = default)
    {
        _logger.LogInformation("VNPay IPN received: {Query}", string.Join("&", query.Select(x => $"{x.Key}={x.Value}")));
        
        var nvc = ToNameValueCollection(query);

        if (!VnpayLibrary.ValidateSignature(nvc, _options.HashSecret, out var data))
            return new VnpayIpnResponse { RspCode = "97", Message = "Invalid signature" };

        if (!data.TryGetValue("vnp_TxnRef", out var txnRef) || string.IsNullOrEmpty(txnRef))
            return new VnpayIpnResponse { RspCode = "01", Message = "Order not found" };

        if (!_cache.TryGetValue(CachePrefix + txnRef, out PendingVnpayPayment? pending) || pending is null)
            return new VnpayIpnResponse { RspCode = "01", Message = "Order not found" };

        if (pending.Confirmed)
            return new VnpayIpnResponse { RspCode = "02", Message = "Order already confirmed" };

        if (!data.TryGetValue("vnp_Amount", out var amountStr) ||
            !long.TryParse(amountStr, out var vnpAmount) ||
            vnpAmount != (long)(pending.Amount * 100))
        {
            return new VnpayIpnResponse { RspCode = "04", Message = "Invalid amount" };
        }

        var responseCode = data.GetValueOrDefault("vnp_ResponseCode");
        var transactionStatus = data.GetValueOrDefault("vnp_TransactionStatus");
        var isSuccess = responseCode == "00" && transactionStatus == "00";

        if (isSuccess)
        {
            await ConfirmPaymentAsync(pending, data, ct);
            _cache.Set(CachePrefix + txnRef, pending with { Confirmed = true }, TimeSpan.FromHours(24));
            return new VnpayIpnResponse { RspCode = "00", Message = "Confirm Success" };
        }

        // Giao dịch thất bại vẫn trả 00 để VNPay dừng retry IPN
        return new VnpayIpnResponse { RspCode = "00", Message = "Confirm Success" };
    }

    public bool TryValidateReturn(IQueryCollection query, out Dictionary<string, string> data)
    {
        var nvc = ToNameValueCollection(query);
        return VnpayLibrary.ValidateSignature(nvc, _options.HashSecret, out data);
    }

    // Admin: Xác nhận thanh toán VNPay thủ công (khi khách đã trả nhưng IPN không hoạt động)
    public async Task<ServiceResult> ConfirmManualPaymentAsync(int maDonHang, CancellationToken ct = default)
    {
        var order = await _context.DonHangs
            .Include(x => x.HoaDon).ThenInclude(h => h!.ThanhToans)
            .FirstOrDefaultAsync(x => x.MaDonHang == maDonHang, ct);

        if (order is null)
            return ServiceResult.Fail($"Không tìm thấy đơn hàng #{maDonHang}.");

        if (order.TrangThai != "ChoThanhToan")
            return ServiceResult.Fail($"Đơn hàng đang ở trạng thái '{order.TrangThai}', không thể xác nhận thanh toán.");

        if (order.HoaDon is null)
            return ServiceResult.Fail("Đơn hàng không có hóa đơn.");

        if (order.HoaDon.TrangThai == "COD")
            return ServiceResult.Fail("Đơn hàng COD, không cần xác nhận thanh toán VNPay.");

        if (order.HoaDon.TrangThai == "DaThanhToan")
            return ServiceResult.Fail("Đơn hàng đã được thanh toán.");

        order.HoaDon.TrangThai = "DaThanhToan";

        var hasExistingPayment = order.HoaDon.ThanhToans
            .Any(t => t.PhuongThucThanhToan == "VNPAY" && t.TrangThai == "ThanhCong");

        if (!hasExistingPayment)
        {
            _context.ThanhToans.Add(new ThanhToan
            {
                MaHoaDon = order.HoaDon.MaHoaDon,
                PhuongThucThanhToan = "VNPAY",
                SoTien = order.HoaDon.TongThanhToan,
                TrangThai = "ThanhCong",
                ThoiGianThanhToan = GetVietnamNow(),
                GhiChu = "Admin xac nhan thanh toan VNPay thu cong",
            });
        }

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            order.TrangThai = "ChoBep";

            var deductResult = await _orderInventoryService.DeductForOrderAsync(maDonHang, null, ct);
            if (!deductResult.Success)
            {
                await tx.RollbackAsync(ct);
                return ServiceResult.Fail(deductResult.Message ?? "Lỗi trừ kho nguyên liệu.");
            }

            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }

        return ServiceResult.Ok("Đã xác nhận thanh toán VNPay thủ công.");
    }

    // Có maDonHang → cập nhật HoaDon + ghi ThanhToan
    private async Task ConfirmPaymentAsync(
        PendingVnpayPayment pending,
        Dictionary<string, string> data,
        CancellationToken ct)
    {
        if (!pending.MaDonHang.HasValue)
            return;

        var hoaDon = await _context.HoaDons
            .Include(x => x.MaDonHangNavigation)
            .FirstOrDefaultAsync(x => x.MaDonHang == pending.MaDonHang.Value, ct);

        if (hoaDon is null)
            return;

        if (hoaDon.TrangThai == "DaThanhToan")
            return;

        hoaDon.TrangThai = "DaThanhToan";
        hoaDon.MaDonHangNavigation.TrangThai = "ChoBep";

        var thanhToan = new ThanhToan
        {
            MaHoaDon = hoaDon.MaHoaDon,
            PhuongThucThanhToan = "VNPAY",
            SoTien = pending.Amount,
            MaGiaoDich = data.GetValueOrDefault("vnp_TransactionNo"),
            TrangThai = "ThanhCong",
            ThoiGianThanhToan = GetVietnamNow(),
            GhiChu = $"TxnRef={data.GetValueOrDefault("vnp_TxnRef")}",
        };

        _context.ThanhToans.Add(thanhToan);

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var deductResult = await _orderInventoryService.DeductForOrderAsync(
                pending.MaDonHang.Value, null, ct);
            if (!deductResult.Success)
            {
                await tx.RollbackAsync(ct);
                return;
            }

            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            // Gửi email xác nhận sau khi thanh toán VNPay thành công
            try
            {
                _logger.LogInformation("VNPay: Bắt đầu gửi email xác nhận cho đơn #{OrderId}", pending.MaDonHang!.Value);
                await _orderConfirmationEmailService.SendConfirmationAsync(pending.MaDonHang!.Value, ct);
                _logger.LogInformation("VNPay: Đã gửi email xác nhận cho đơn #{OrderId}", pending.MaDonHang!.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "VNPay: Gửi email xác nhận thất bại cho đơn #{OrderId}", pending.MaDonHang!.Value);
            }
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task SendConfirmationEmailAsync(int maDonHang, CancellationToken ct = default)
    {
        try
        {
            _logger.LogInformation("VNPay Return: Bắt đầu gửi email xác nhận cho đơn #{OrderId}", maDonHang);
            await _orderConfirmationEmailService.SendConfirmationAsync(maDonHang, ct);
            _logger.LogInformation("VNPay Return: Đã gửi email xác nhận cho đơn #{OrderId}", maDonHang);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VNPay Return: Gửi email xác nhận thất bại cho đơn #{OrderId}", maDonHang);
        }
    }

    private static string NormalizeOrderInfo(string text)
    {
        var normalized = text.Normalize(System.Text.NormalizationForm.FormD);
        var sb = new System.Text.StringBuilder();
        foreach (var c in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        var noDiacritics = sb.ToString().Normalize(System.Text.NormalizationForm.FormC);
        noDiacritics = OrderInfoRegex().Replace(noDiacritics, " ");
        return noDiacritics.Trim();
    }

    private static DateTime GetVietnamNow()
    {
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        }
        catch (TimeZoneNotFoundException)
        {
            return DateTime.UtcNow.AddHours(7);
        }
    }

    private static NameValueCollection ToNameValueCollection(IQueryCollection query)
    {
        var nvc = new NameValueCollection();
        foreach (var item in query)
            nvc.Add(item.Key, item.Value.ToString());
        return nvc;
    }

    [GeneratedRegex(@"[^a-zA-Z0-9\s]")]
    private static partial Regex OrderInfoRegex();

    private sealed record PendingVnpayPayment(decimal Amount, int? MaDonHang, bool Confirmed);
}
