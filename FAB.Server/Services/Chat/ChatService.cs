using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Chat;

public class ChatService : IChatService
{
    private readonly FabDbContext _context;
    private readonly IGeminiService _gemini;

    public ChatService(FabDbContext context, IGeminiService gemini)
    {
        _context = context;
        _gemini = gemini;
    }

    public ChatStatusResponse GetStatus()
    {
        return new ChatStatusResponse
        {
            Configured = _gemini.IsConfigured,
            Model = _gemini.IsConfigured ? _gemini.Model : string.Empty,
            Message = _gemini.IsConfigured
                ? null
                : "Thêm Gemini:ApiKey vào User Secrets để bật Gemini AI.",
        };
    }

    public async Task<ServiceResult<ChatResponse>> SendAsync(ChatRequest request, CancellationToken ct = default)
    {
        var message = request.Message?.Trim();
        if (string.IsNullOrWhiteSpace(message))
            return ServiceResult<ChatResponse>.Fail("Vui lòng nhập câu hỏi.");

        var sessionId = string.IsNullOrWhiteSpace(request.SessionId)
            ? Guid.NewGuid().ToString("N")
            : request.SessionId.Trim();

        var products = await GetProductsAsync(ct);
        var (reply, source) = await GetReplyAsync(message, products, ct);

        _context.LichSuChatAis.Add(new LichSuChatAi
        {
            MaNguoiDung = request.MaNguoiDung,
            NoiDungNguoiDung = message,
            NoiDungAi = reply,
            MaPhienChat = sessionId,
            ThoiGian = DateTime.Now,
        });
        await _context.SaveChangesAsync(ct);

        return ServiceResult<ChatResponse>.Ok(new ChatResponse
        {
            Reply = reply,
            SessionId = sessionId,
            Source = source,
        });
    }

    private async Task<(string Reply, string Source)> GetReplyAsync(
        string message, List<ProductSnippet> products, CancellationToken ct)
    {
        if (_gemini.IsConfigured)
        {
            var systemPrompt = BuildSystemPrompt(products);
            var result = await _gemini.GenerateReplyAsync(systemPrompt, message, ct);
            if (result.Success && result.Data is not null)
                return (result.Data, "gemini");
        }

        return (ChatFallbackService.BuildReply(message, products), "menu");
    }

    private async Task<List<ProductSnippet>> GetProductsAsync(CancellationToken ct)
    {
        return await _context.SanPhams
            .AsNoTracking()
            .Where(x => x.TrangThai)
            .OrderByDescending(x => x.NgayTao)
            .Take(20)
            .Select(x => new ProductSnippet(x.TenSanPham, x.GiaBan, x.MoTa))
            .ToListAsync(ct);
    }

    private static string BuildSystemPrompt(IReadOnlyList<ProductSnippet> products)
    {
        var catalog = products.Count == 0
            ? "Chưa có dữ liệu sản phẩm trong hệ thống."
            : string.Join("\n", products.Select(p =>
                $"- {p.TenSanPham}: {p.GiaBan:N0}đ{(string.IsNullOrWhiteSpace(p.MoTa) ? "" : $" — {p.MoTa}")}"));

        return $"""
            Bạn là trợ lý bán hàng của Flygo Bakery (tiệm bánh và cà phê tại Việt Nam).
            Trả lời ngắn gọn, thân thiện, bằng tiếng Việt. Luôn trả lời đúng câu hỏi khách đặt ra.
            Nhiệm vụ: gợi ý bánh/cà phê/combo, giải thích cách đặt hàng trên website, thanh toán COD (trả khi nhận) hoặc VNPay (thẻ/QR).
            Chỉ dùng giá và tên sản phẩm trong danh sách dưới đây, không bịa giá hoặc sản phẩm không có.
            Không xác nhận đơn hàng thay khách — hướng dẫn thêm vào giỏ và thanh toán trên web.

            Thông tin Flygo:
            - Thành lập 2020, hoạt động hơn 5 năm
            - Mở cửa 7:00–22:00 hàng ngày
            - Giao hàng nội thành 30–60 phút

            Danh sách sản phẩm:
            {catalog}
            """;
    }
}
