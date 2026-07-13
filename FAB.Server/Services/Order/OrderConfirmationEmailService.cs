// ============== THƯ VIỆN ==============
using System.Globalization;      // Format ngày tháng, số tiền theo culture Việt Nam
using System.Net;                // Mã hóa HTML (tránh XSS)
using System.Text;               // Nối chuỗi HTML hiệu quả
using FAB.Server.Context;         // Database context
using FAB.Server.Services.Email;  // Gọi EmailService gửi email
using Microsoft.EntityFrameworkCore;

// ============== ĐỊNH NGHĨA NAMESPACE ==============
namespace FAB.Server.Services.Order;

// ============== CLASS GỬI EMAIL XÁC NHẬN ĐƠN HÀNG ==============
public class OrderConfirmationEmailService : IOrderConfirmationEmailService
{
    // ---- Kết nối Database ----
    private readonly FabDbContext _context;
    
    // ---- Service gửi email ----
    private readonly IEmailService _emailService;
    
    // ---- Logger ghi log ----
    private readonly ILogger<OrderConfirmationEmailService> _logger;
    
    // ---- URL frontend để tạo link theo dõi ----
    private readonly string _frontendUrl = "http://localhost:5174"; // URL trang web Flygo

    // ---- Constructor: Tiêm dependency ----
    public OrderConfirmationEmailService(
        FabDbContext context,
        IEmailService emailService,
        ILogger<OrderConfirmationEmailService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    // ============== HÀM CHÍNH: GỬI EMAIL XÁC NHẬN ==============
    // maDonHang: Mã đơn hàng cần gửi email xác nhận
    // Trả về: true = gửi thành công, false = thất bại
    public async Task<bool> SendConfirmationAsync(int maDonHang, CancellationToken ct = default)
    {
        // ---- Bước 1: Kiểm tra SMTP đã cấu hình chưa ----
        if (!_emailService.IsConfigured)
        {
            // Nếu chưa cấu hình email → bỏ qua, không ném lỗi
            _logger.LogWarning(
                "Bỏ qua email xác nhận đơn #{OrderId}: SMTP chưa cấu hình.",
                maDonHang);
            return false;  // Trả về false nhưng không crash app
        }

        // ---- Bước 2: Lấy thông tin đơn hàng từ Database ----
        // Include các bảng liên quan: sản phẩm, khách hàng, giao hàng, thanh toán
        var order = await _context.DonHangs
            .Include(d => d.ChiTietDonHangs)           // Chi tiết sản phẩm trong đơn
                .ThenInclude(c => c.MaSanPhamNavigation) // Tên sản phẩm
            .Include(d => d.MaKhachHangNavigation)      // Thông tin khách hàng
            .Include(d => d.MaNguoiTaoNavigation)       // Người tạo đơn
            .Include(d => d.GiaoHangs)                  // Thông tin giao hàng
            .Include(d => d.HoaDon)                     // Hóa đơn
                .ThenInclude(h => h!.ThanhToans)        // Thanh toán (COD/VNPay)
            .AsNoTracking()  // Chỉ đọc, không cập nhật
            .FirstOrDefaultAsync(d => d.MaDonHang == maDonHang, ct);

        // ---- Bước 3: Kiểm tra đơn hàng tồn tại ----
        if (order is null)
        {
            _logger.LogWarning("Không gửi email xác nhận: đơn #{OrderId} không tồn tại.", maDonHang);
            return false;
        }

        // ---- Bước 4: Kiểm tra TrackingToken (để theo dõi đơn) ----
        // TrackingToken là mã duy nhất để khách hàng tra cứu đơn hàng
        if (string.IsNullOrWhiteSpace(order.TrackingToken))
        {
            _logger.LogWarning("Không gửi email xác nhận: đơn #{OrderId} không có TrackingToken.", maDonHang);
            return false;
        }

        // ---- Bước 5: Lấy email khách hàng ----
        // Ưu tiên: GhiChu > KhachHang.Email > NguoiTao.Email
        var email = ResolveCustomerEmail(order);
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogInformation("Bỏ qua gửi email xác nhận đơn #{OrderId}: khách không có email.", maDonHang);
            return false;
        }

        // ---- Bước 6: Chuẩn bị dữ liệu cho email ----
        
        // Lấy thông tin giao hàng mới nhất
        var delivery = order.GiaoHangs.OrderByDescending(g => g.NgayTao).FirstOrDefault();
        
        // Kiểm tra thanh toán COD hay online
        var isCod = order.HoaDon?.ThanhToans.Any(t => t.PhuongThucThanhToan == "COD") == true;
        var paymentLabel = isCod 
            ? "Thanh toán khi nhận hàng (COD)"  // Trả tiền khi nhận hàng
            : "Đã thanh toán online (VNPAY)";   // Đã chuyển khoản trước
        
        // Phí giao hàng (nếu có)
        var shipFee = delivery?.PhiGiaoHang ?? 0;
        
        // Mã đơn hàng hiển thị (VD: #ORD-0001)
        var orderCode = $"#ORD-{order.MaDonHang:D4}";
        
        // Tên khách hàng (ưu tiên: người nhận > khách hàng > người tạo)
        var customerName = delivery?.NguoiNhan
            ?? order.MaKhachHangNavigation?.HoTen
            ?? order.MaNguoiTaoNavigation?.HoTen
            ?? "Khách hàng";

        // ---- Bước 7: TẠO LINK THEO DÕI ĐƠN HÀNG ----
        // VD: http://localhost:5174/tra-cuu-don?t=abc123xyz
        var trackingLink = $"{_frontendUrl}/tra-cuu-don?t={order.TrackingToken}";
        
        // Tiêu đề email
        var subject = $"[Flygo] Xác nhận đơn hàng {orderCode}";
        
        // Tạo HTML cho email
        var html = BuildConfirmationHtml(
            order, delivery, shipFee, orderCode, 
            customerName, paymentLabel, trackingLink);

        // ---- Bước 8: GỬI EMAIL! ----
        // isHtml: true vì email chứa HTML đẹp
        await _emailService.SendAsync(email, subject, html, isHtml: true, ct);
        
        _logger.LogInformation("Đã gửi email xác nhận đơn #{OrderId} tới {Email}.", maDonHang, email);
        return true;
    }

    // ============== LẤY EMAIL KHÁCH HÀNG ==============
    // Ưu tiên: GhiChu (chứa "EMAIL:xxx") > KhachHang > NguoiTao
    private static string? ResolveCustomerEmail(Models.DonHang order)
    {
        // Cách 1: Lấy email từ GhiChu (format: "EMAIL:abc@example.com|...")
        if (!string.IsNullOrWhiteSpace(order.GhiChu))
        {
            // Split theo dấu "|" để lấy từng phần
            foreach (var part in order.GhiChu.Split('|', StringSplitOptions.TrimEntries))
            {
                // Tìm phần bắt đầu bằng "EMAIL:"
                if (part.StartsWith("EMAIL:", StringComparison.OrdinalIgnoreCase))
                    // Cắt bỏ "EMAIL:" (6 ký tự), lấy phần còn lại
                    return part[6..].Trim();
            }
        }

        // Cách 2: Lấy từ bảng KhachHang
        if (!string.IsNullOrWhiteSpace(order.MaKhachHangNavigation?.Email))
            return order.MaKhachHangNavigation.Email.Trim();

        // Cách 3: Lấy từ bảng NguoiDung (người tạo đơn)
        if (!string.IsNullOrWhiteSpace(order.MaNguoiTaoNavigation?.Email))
            return order.MaNguoiTaoNavigation.Email.Trim();

        // Không có email
        return null;
    }

    // ============== TẠO HTML CHO EMAIL XÁC NHẬN ==============
    // Trả về chuỗi HTML đẹp để gửi qua email
    private static string BuildConfirmationHtml(
        Models.DonHang order,
        Models.GiaoHang? delivery,   // Thông tin giao hàng (null nếu nhận tại cửa hàng)
        decimal shipFee,              // Phí giao hàng
        string orderCode,            // Mã đơn: #ORD-0001
        string customerName,          // Tên khách hàng
        string paymentLabel,         // "COD" hoặc "VNPay"
        string trackingLink)         // Link theo dõi đơn hàng
    {
        // ---- Tạo danh sách sản phẩm (HTML table) ----
        var rows = new StringBuilder();
        foreach (var item in order.ChiTietDonHangs)
        {
            // Tên sản phẩm (có thể null)
            var name = item.MaSanPhamNavigation?.TenSanPham ?? "Sản phẩm";
            
            // Thành tiền = Đơn giá × Số lượng
            var lineTotal = item.ThanhTien ?? item.DonGia * item.SoLuong;
            
            // Thêm 1 dòng vào bảng sản phẩm
            rows.Append($@"
                <tr>
                    <td style='padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569;'>{H(name)}</td>
                    <td style='padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; text-align: center;'>{item.SoLuong}</td>
                    <td style='padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; text-align: right;'>{FormatMoney(item.DonGia)}</td>
                    <td style='padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; text-align: right;'>{FormatMoney(lineTotal)}</td>
                </tr>");
        }

        // Địa chỉ giao hàng
        var addressLine = delivery is not null ? H(delivery.DiaChiGiao) : "Nhận tại cửa hàng";
        
        // Format ngày: 01/07/2026 14:30
        var dateFormatted = order.NgayTao.ToString("dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);

        // ---- Trả về HTML hoàn chỉnh ----
        return $@"
        <!DOCTYPE html>
        <html lang='vi'>
        <head><meta charset='utf-8'></head>
        <body style='margin:0;padding:24px;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                
                <!-- HEADER: Màu xanh teal, logo -->
                <div style='background-color: #1e6b6b; padding: 30px; color: #ffffff;'>
                    <h1 style='margin: 0 0 10px 0; font-size: 24px;'>Đặt hàng thành công!</h1>
                    <p style='margin: 0; font-size: 14px; opacity: 0.9;'>Cảm ơn {H(customerName)}, Flygo đã nhận đơn của bạn.</p>
                </div>

                <!-- BODY: Chi tiết đơn hàng -->
                <div style='padding: 30px;'>
                    <p style='color: #64748b; margin: 0 0 5px 0; font-size: 14px;'>Mã đơn hàng</p>
                    <h2 style='color: #1e6b6b; margin: 0 0 25px 0; font-size: 22px;'>{H(orderCode)}</h2>

                    <p style='margin: 0 0 10px 0; font-size: 14px; color: #334155;'><strong>Ngày đặt:</strong> {dateFormatted}</p>
                    <p style='margin: 0 0 10px 0; font-size: 14px; color: #334155;'><strong>Thanh toán:</strong> {H(paymentLabel)}</p>
                    <p style='margin: 0 0 30px 0; font-size: 14px; color: #334155;'><strong>Giao tới:</strong> {addressLine}</p>

                    <!-- BẢNG SẢN PHẨM -->
                    <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                        <thead>
                            <tr>
                                <th style='text-align: left; padding-bottom: 10px; border-bottom: 2px solid #f8fafc; font-size: 14px; color: #1e293b;'>Sản phẩm</th>
                                <th style='text-align: center; padding-bottom: 10px; border-bottom: 2px solid #f8fafc; font-size: 14px; color: #1e293b;'>SL</th>
                                <th style='text-align: right; padding-bottom: 10px; border-bottom: 2px solid #f8fafc; font-size: 14px; color: #1e293b;'>Đơn giá</th>
                                <th style='text-align: right; padding-bottom: 10px; border-bottom: 2px solid #f8fafc; font-size: 14px; color: #1e293b;'>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>

                    <!-- TỔNG TIỀN -->
                    <table style='width: 100%; margin-top: 16px; font-size: 14px;'>
                        <tr>
                            <td style='padding: 6px 0; color: #6b7280;'>Tạm tính</td>
                            <td style='padding: 6px 0; text-align: right;'>{FormatMoney(order.TongTamTinh)}</td>
                        </tr>
                        <tr>
                            <td style='padding: 6px 0; color: #6b7280;'>Giảm giá</td>
                            <td style='padding: 6px 0; text-align: right;'>-{FormatMoney(order.SoTienGiam)}</td>
                        </tr>
                        <tr>
                            <td style='padding: 6px 0; color: #6b7280;'>Phí giao hàng</td>
                            <td style='padding: 6px 0; text-align: right;'>{FormatMoney(shipFee)}</td>
                        </tr>
                        <tr>
                            <td style='padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #1e6b6b;'>Tổng thanh toán</td>
                            <td style='padding: 12px 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #1e6b6b;'>{FormatMoney(order.TongThanhToan)}</td>
                        </tr>
                    </table>

                    <!-- NÚT THEO DÕI ĐƠN HÀNG -->
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <a href='{trackingLink}' style='background-color: #1e6b6b; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 15px; display: inline-block;'>
                            THEO DÕI ĐƠN HÀNG
                        </a>
                    </div>

                    <!-- LINK DỰ PHÒNG -->
                    <p style='text-align: center; font-size: 13px; color: #64748b; margin: 0;'>
                        Hoặc mở link: <a href='{trackingLink}' style='color: #2563eb; text-decoration: underline;'>{trackingLink}</a>
                    </p>
                </div>
            </div>
        </body>
        </html>";
    }

    // ============== HÀM HỖ TRỢ ==============
    
    // Hàm mã hóa HTML (tránh XSS attack)
    // VD: "<script>" → "&lt;script&gt;"
    private static string H(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);
    
    // Hàm format tiền VND
    // VD: 150000 → "150.000đ"
    private static string FormatMoney(decimal amount) => 
        amount.ToString("N0", new CultureInfo("vi-VN")) + "đ";
}
