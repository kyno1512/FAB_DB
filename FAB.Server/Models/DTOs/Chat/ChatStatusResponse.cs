namespace FAB.Server.Models.DTOs;

public class ChatStatusResponse
{
    public bool Configured { get; set; }

    public string Model { get; set; } = string.Empty;

    public string? Message { get; set; }
}
