// ============== THƯ VIỆN .NET ==============
using System.Net;                 // Xử lý địa chỉ mạng, network
using System.Net.Mail;            // Thư viện gửi email của .NET
using FAB.Server.Options;         // Lấy cấu hình SMTP từ appsettings
using Microsoft.Extensions.Options; // Đọc cấu hình từ config

// ============== ĐỊNH NGHĨA NAMESPACE ==============
namespace FAB.Server.Services.Email;

// ============== CLASS GỬI EMAIL ==============
public class EmailService : IEmailService
{
    // ---- Khai báo biến private ----
    private readonly SmtpOptions _options;      // Lưu cấu hình SMTP (host, port, user, pass...)
    private readonly ILogger<EmailService> _logger; // Logger để ghi log

    // ---- Constructor: Tiêm dependency (Dependency Injection) ----
    public EmailService(IOptions<SmtpOptions> options, ILogger<EmailService> logger)
    {
        // Lấy giá trị cấu hình SMTP từ config
        _options = options.Value;
        // Lưu logger để ghi log khi gửi email
        _logger = logger;
    }

    // ---- Kiểm tra SMTP đã được cấu hình chưa ----
    public bool IsConfigured =>
        // Kiểm tra từng trường có null/empty không
        !string.IsNullOrWhiteSpace(_options.Host) &&      // Host SMTP (vd: smtp.gmail.com)
        !string.IsNullOrWhiteSpace(_options.User) &&      // Tài khoản gửi email
        !string.IsNullOrWhiteSpace(_options.Pass) &&      // Mật khẩu app
        !string.IsNullOrWhiteSpace(_options.FromAddress); // Email người gửi

    // ============== HÀM GỬI EMAIL CHÍNH ==============
    public async Task SendAsync(
        string to,                  // Email người nhận
        string subject,              // Tiêu đề email
        string body,                 // Nội dung email
        bool isHtml = false,         // Có phải HTML không (mặc định: text thường)
        CancellationToken cancellationToken = default // Token hủy bỏ (nếu user cancel request)
    )
    {
        // ---- Bước 1: Kiểm tra SMTP đã cấu hình chưa ----
        if (!IsConfigured)
        {
            // Nếu chưa cấu hình đầy đủ → ném lỗi
            throw new InvalidOperationException(
                "Cấu hình SMTP chưa đầy đủ. Điền Smtp:User, Pass, FromAddress trong User Secrets hoặc appsettings."
            );
        }

        // ---- Bước 2: Tạo đối tượng Email (MailMessage) ----
        using var message = new MailMessage  // using = tự động giải phóng bộ nhớ khi xong
        {
            // Người gửi: lấy từ cấu hình
            From = new MailAddress(_options.FromAddress, _options.FromName),
            // Tiêu đề email
            Subject = subject,
            // Nội dung email
            Body = body,
            // Body là HTML hay text thường?
            // true = body chứa thẻ HTML như <b>, <a>
            // false = body là text thường
            IsBodyHtml = isHtml,
        };

        // Thêm người nhận vào danh sách (To)
        message.To.Add(to);

        // ---- Bước 3: Tạo kết nối SMTP Client ----
        using var client = new SmtpClient(_options.Host, _options.Port)  // Host + Port từ config
        {
            // Bật SSL/TLS để mã hóa kết nối (bắt buộc với Gmail)
            EnableSsl = _options.EnableSsl,
            // Xác thực: gửi kèm username + password
            Credentials = new NetworkCredential(_options.User, _options.Pass),
        };

        // ---- Bước 4: GỬI EMAIL! ----
        // Gửi email một cách bất đồng bộ (async)
        await client.SendMailAsync(message, cancellationToken);

        // ---- Bước 5: Ghi log khi gửi thành công ----
        _logger.LogInformation("Đã gửi email tới {Recipient}", to);
        // {Recipient} sẽ được thay bằng giá trị biến `to`
        // Log output: "Đã gửi email tới user@example.com"
    }
}
