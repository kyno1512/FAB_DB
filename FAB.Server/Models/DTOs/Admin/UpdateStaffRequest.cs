namespace FAB.Server.Models.DTOs;

public class UpdateStaffRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public int MaVaiTro { get; set; }
    public bool TrangThai { get; set; }
    public string? Password { get; set; }
}
