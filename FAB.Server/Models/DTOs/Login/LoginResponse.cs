namespace FAB.Server.Models.DTOs;

public class LoginResponse
{
    public int MaNguoiDung { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int MaVaiTro { get; set; }
    public string TenVaiTro { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}
