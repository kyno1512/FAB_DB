namespace FAB.Server.Models.DTOs;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ResetPasswordDebugRequest
{
    public string Email { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

public class ResetPasswordDebugResponse
{
    public string Message { get; set; } = null!;
}
