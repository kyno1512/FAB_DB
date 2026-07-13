namespace FAB.Server.Models.DTOs;

public class UpdateProfileRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string? DiaChi { get; set; }
    public string? NgaySinh { get; set; }
    public string? AnhDaiDien { get; set; }
}
