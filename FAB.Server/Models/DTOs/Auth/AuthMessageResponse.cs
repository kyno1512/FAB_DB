namespace FAB.Server.Models.DTOs;

public class AuthMessageResponse
{
    public string Message { get; set; } = string.Empty;
    public bool OtpSent { get; set; }
    public string? Otp { get; set; }
}
