namespace FAB.Server.Models.DTOs;

public class CreateStaffRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public int MaVaiTro { get; set; }
    public string Password { get; set; } = string.Empty;
}
