// ============== THƯ VIỆN ==============
using System.Globalization;      // Format ngày tháng, số tiền theo culture Việt Nam
using System.Net;                // Mã hóa HTML (tránh XSS)
using System.Text;               // Nối chuỗi HTML hiệu quả
using FAB.Server.Context;         // Database context
using FAB.Server.Services.Email;  // Gọi EmailService gửi email
using Microsoft.EntityFrameworkCore;

// ============== ĐỊNH NGHĨA NAMESPACE ==============
namespace FAB.Server.Services.Order;

// ============== INTERFACE ==============
// Định nghĩa hành vi của service gửi hóa đơn
public interface IInvoiceEmailService
{
    // Gửi hóa đơn cho đơn hàng
    // maDonHang: Mã đơn hàng cần gửi hóa đơn
    Task SendInvoiceAsync(int maDonHang, CancellationToken ct = default);
}

// ============== CLASS GỬI HÓA ĐƠN ==============
public class InvoiceEmailService : IInvoiceEmailService
{
    // ---- Kết nối Database ----
    private readonly FabDbContext _context;
    
    // ---- Service gửi email ----
    private readonly IEmailService _emailService;
    
    // ---- Logger ghi log ----
    private readonly ILogger<InvoiceEmailService> _logger;

    // ---- Constructor: Tiêm dependency ----
    public InvoiceEmailService(
        FabDbContext context,
        IEmailService emailService,
        ILogger<InvoiceEmailService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    // ============== HÀM CHÍNH: GỬI HÓA ĐƠN ==============
    // Được gọi khi đơn hàng hoàn thành (DaHoanThanh)
    public async Task SendInvoiceAsync(int maDonHang, CancellationToken ct = default)
    {
        // ---- Bước 1: Lấy thông tin đơn hàng từ Database ----
        var order = await _context.DonHangs
            .Include(d => d.ChiTietDonHangs)           // Chi tiết sản phẩm
                .ThenInclude(c => c.MaSanPhamNavigation) // Tên sản phẩm
            .Include(d => d.MaKhachHangNavigation)      // Thông tin khách hàng
            .Include(d => d.MaNguoiTaoNavigation)       // Người tạo đơn
            .Include(d => d.GiaoHangs)                  // Thông tin giao hàng
            .Include(d => d.HoaDon)                     // Hóa đơn
                .ThenInclude(h => h!.ThanhToans)        // Thanh toán (COD/VNPay)
            .AsNoTracking()  // Chỉ đọc, không cập nhật
            .FirstOrDefaultAsync(d => d.MaDonHang == maDonHang, ct);

        // ---- Bước 2: Kiểm tra đơn hàng tồn tại ----
        if (order is null)
        {
            _logger.LogWarning("Không gửi hóa đơn: đơn #{OrderId} không tồn tại.", maDonHang);
            return;
        }

        // ---- Bước 3: Lấy email khách hàng ----
        var email = ResolveCustomerEmail(order);
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogInformation(
                "Bỏ qua gửi hóa đơn đơn #{OrderId}: khách không có email.",
                maDonHang);
            return;
        }

        // ---- Bước 4: Chuẩn bị dữ liệu cho email ----
        
        // Lấy thông tin giao hàng mới nhất
        var delivery = order.GiaoHangs.OrderByDescending(g => g.NgayTao).FirstOrDefault();
        
        // Kiểm tra thanh toán COD hay online
        var isCod = order.HoaDon?.ThanhToans.Any(t => t.PhuongThucThanhToan == "COD") == true;
        var paymentLabel = isCod 
            ? "COD (đã thu khi giao)"     // Trả tiền khi nhận hàng
            : "VNPay (đã thanh toán online)"; // Đã chuyển khoản trước
        
        // Số hóa đơn (từ DB hoặc tạo mã tự động)
        var soHoaDon = order.HoaDon?.SoHoaDon ?? $"DH{order.MaDonHang:D6}";
        
        // Phí giao hàng
        var shipFee = delivery?.PhiGiaoHang ?? 0m;
        
        // Tên khách hàng
        var customerName = delivery?.NguoiNhan
            ?? order.MaKhachHangNavigation?.HoTen
            ?? order.MaNguoiTaoNavigation?.HoTen
            ?? "Khách hàng";

        // ---- Bước 5: TẠO EMAIL ----
        
        // Tiêu đề: "[Flygo] Hóa đơn HD20260706001 — 150.000đ"
        var subject = $"[Flygo] Hóa đơn {soHoaDon} — {FormatMoney(order.TongThanhToan)}";
        
        // Tạo HTML cho email hóa đơn
        var html = BuildInvoiceHtml(order, delivery, soHoaDon, customerName, paymentLabel, shipFee);

        // ---- Bước 6: GỬI EMAIL! ----
        await _emailService.SendAsync(email, subject, html, isHtml: true, ct);
        
        _logger.LogInformation("Đã gửi hóa đơn đơn #{OrderId} tới {Email}.", maDonHang, email);
    }

    // ============== LẤY EMAIL KHÁCH HÀNG ==============
    // Ưu tiên: GhiChu > KhachHang > NguoiTao
    private static string? ResolveCustomerEmail(Models.DonHang order)
    {
        // Cách 1: Lấy email từ GhiChu (format: "EMAIL:xxx|...")
        var fromNote = ParseEmailFromOrderNote(order.GhiChu);
        if (!string.IsNullOrWhiteSpace(fromNote))
            return fromNote;

        // Cách 2: Lấy từ bảng KhachHang
        if (!string.IsNullOrWhiteSpace(order.MaKhachHangNavigation?.Email))
            return order.MaKhachHangNavigation.Email.Trim();

        // Cách 3: Lấy từ bảng NguoiDung
        if (!string.IsNullOrWhiteSpace(order.MaNguoiTaoNavigation?.Email))
            return order.MaNguoiTaoNavigation.Email.Trim();

        // Không có email
        return null;
    }

    // ============== TÁCH EMAIL TỪ GHI CHÚ ==============
    // Format: "Nguyen Van A|EMAIL:abc@example.com|SDT:0123456789"
    private static string? ParseEmailFromOrderNote(string? ghiChu)
    {
        // Không có ghi chú
        if (string.IsNullOrWhiteSpace(ghiChu))
            return null;

        // Split theo dấu "|" để lấy từng phần
        foreach (var part in ghiChu.Split('|', StringSplitOptions.TrimEntries))
        {
            // Tìm phần bắt đầu bằng "EMAIL:"
            if (part.StartsWith("EMAIL:", StringComparison.OrdinalIgnoreCase))
                // Cắt bỏ "EMAIL:" (6 ký tự), lấy phần còn lại
                return part[6..].Trim();
        }

        return null;
    }

    // ============== TẠO HTML CHO HÓA ĐƠN ==============
    private static string BuildInvoiceHtml(
        Models.DonHang order,
        Models.GiaoHang? delivery,    // Thông tin giao hàng
        string soHoaDon,              // Số hóa đơn: HD20260706001
        string customerName,           // Tên khách hàng
        string paymentLabel,         // "COD" hoặc "VNPay"
        decimal shipFee)              // Phí giao hàng
    {
        // ---- Tạo danh sách sản phẩm (HTML table) ----
        var rows = new StringBuilder();
        foreach (var item in order.ChiTietDonHangs)
        {
            // Tên sản phẩm
            var name = item.MaSanPhamNavigation?.TenSanPham ?? "Sản phẩm";
            
            // Thành tiền
            var lineTotal = item.ThanhTien ?? item.DonGia * item.SoLuong;
            
            // Thêm 1 dòng vào bảng
            rows.Append("<tr>")
                .Append("<td style=\"padding:10px 8px;border-bottom:1px solid #eee;\">").Append(H(name)).Append("</td>")
                .Append("<td style=\"padding:10px 8px;border-bottom:1px solid #eee;text-align:center;\">").Append(item.SoLuong).Append("</td>")
                .Append("<td style=\"padding:10px 8px;border-bottom:1px solid #eee;text-align:right;\">").Append(H(FormatMoney(item.DonGia))).Append("</td>")
                .Append("<td style=\"padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;\">").Append(H(FormatMoney(lineTotal))).Append("</td>")
                .Append("</tr>");
        }

        // ---- Thông tin giao hàng ----
        var addressBlock = delivery is not null
            ? $"""
               <p style="margin:0 0 6px;"><strong>Người nhận:</strong> {H(delivery.NguoiNhan)}</p>
               <p style="margin:0 0 6px;"><strong>SĐT:</strong> {H(delivery.SdtnguoiNhan)}</p>
               <p style="margin:0;"><strong>Địa chỉ:</strong> {H(delivery.DiaChiGiao)}</p>
               """
            : "<p style=\"margin:0;\">Giao tận nơi</p>";

        // ---- Trả về HTML hoàn chỉnh ----
        return $"""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="utf-8"></head>
            <body style="margin:0;padding:24px;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;color:#1f2937;">
              <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.06);">
              
                <!-- HEADER: Logo + Tiêu đề -->
                <div style="background:#1e6b6b;color:#fff;padding:24px 28px;">
                  <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.85;">Flygo Bakery</div>
                  <h1 style="margin:8px 0 0;font-size:24px;">Hóa đơn điện tử</h1>
                  <p style="margin:8px 0 0;opacity:.9;">Cảm ơn bạn đã đặt hàng tại Flygo!</p>
                </div>
                
                <!-- BODY -->
                <div style="padding:24px 28px;">
                
                  <!-- Thông tin chung -->
                  <table style="width:100%;margin-bottom:20px;font-size:14px;">
                    <tr>
                      <td style="padding:4px 0;color:#6b7280;">Số hóa đơn</td>
                      <td style="padding:4px 0;text-align:right;font-weight:600;">{H(soHoaDon)}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;color:#6b7280;">Mã đơn</td>
                      <td style="padding:4px 0;text-align:right;">#{order.MaDonHang}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;color:#6b7280;">Khách hàng</td>
                      <td style="padding:4px 0;text-align:right;">{H(customerName)}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;color:#6b7280;">Ngày đặt</td>
                      <td style="padding:4px 0;text-align:right;">{H(order.NgayTao.ToString("dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture))}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;color:#6b7280;">Thanh toán</td>
                      <td style="padding:4px 0;text-align:right;">{H(paymentLabel)}</td>
                    </tr>
                  </table>

                  <!-- Thông tin giao hàng -->
                  <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px;font-size:14px;">
                    <div style="font-size:12px;font-weight:700;color:#1e6b6b;text-transform:uppercase;margin-bottom:8px;">Giao hàng</div>
                    {addressBlock}
                  </div>

                  <!-- Bảng sản phẩm -->
                  <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <thead>
                      <tr style="background:#f8fafc;">
                        <th style="padding:10px 8px;text-align:left;">Sản phẩm</th>
                        <th style="padding:10px 8px;text-align:center;">SL</th>
                        <th style="padding:10px 8px;text-align:right;">Đơn giá</th>
                        <th style="padding:10px 8px;text-align:right;">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </table>

                  <!-- Tổng tiền -->
                  <table style="width:100%;margin-top:16px;font-size:14px;">
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;">Tạm tính</td>
                      <td style="padding:6px 0;text-align:right;">{H(FormatMoney(order.TongTamTinh))}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;">Giảm giá</td>
                      <td style="padding:6px 0;text-align:right;">-{H(FormatMoney(order.SoTienGiam))}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#6b7280;">Phí giao hàng</td>
                      <td style="padding:6px 0;text-align:right;">{H(FormatMoney(shipFee))}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#1e6b6b;">Tổng thanh toán</td>
                      <td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:700;color:#1e6b6b;">{H(FormatMoney(order.TongThanhToan))}</td>
                    </tr>
                  </table>
                </div>
                
                <!-- FOOTER -->
                <div style="padding:16px 28px 24px;background:#f8fafc;font-size:12px;color:#6b7280;text-align:center;">
                  Email tự động từ Flygo · Vui lòng không trả lời email này.
                </div>
              </div>
            </body>
            </html>
            """;
    }

    // ============== HÀM HỖ TRỢ ==============
    
    // Hàm mã hóa HTML (tránh XSS attack)
    private static string H(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);
    
    // Hàm format tiền VND
    // VD: 150000 → "150.000đ"
    private static string FormatMoney(decimal amount) =>
        amount.ToString("N0", new CultureInfo("vi-VN")) + "đ";
}
