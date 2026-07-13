namespace FAB.Server.Models.DTOs;

public class RegisterRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string? DiaChi { get; set; }
}
