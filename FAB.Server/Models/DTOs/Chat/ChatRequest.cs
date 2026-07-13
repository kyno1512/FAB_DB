namespace FAB.Server.Models.DTOs;

public class ChatRequest
{
    public string Message { get; set; } = string.Empty;

    public string? SessionId { get; set; }

    public int? MaNguoiDung { get; set; }
}
