namespace FAB.Server.Models.DTOs;

public class StaffListItemDto
{
    public int MaNguoiDung { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public int MaVaiTro { get; set; }
    public string TenVaiTro { get; set; } = string.Empty;
    public bool TrangThai { get; set; }
    public DateTime NgayTao { get; set; }
    public string MatKhau { get; set; } = string.Empty;
}
