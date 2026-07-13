namespace FAB.Server.Models.DTOs;

public class ChatResponse
{
    public string Reply { get; set; } = string.Empty;

    public string SessionId { get; set; } = string.Empty;

    /// <summary>gemini hoặc menu — để biết bot đang dùng AI hay fallback.</summary>
    public string Source { get; set; } = "menu";
}
