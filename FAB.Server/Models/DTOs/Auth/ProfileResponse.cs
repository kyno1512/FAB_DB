namespace FAB.Server.Models.DTOs;

public class ProfileResponse
{
    public int MaNguoiDung { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? AnhDaiDien { get; set; }
    public string TenVaiTro { get; set; } = string.Empty;
    public DateTime NgayTao { get; set; }
    public int? MaKhachHang { get; set; }
    public string? DiaChi { get; set; }
    public int DiemTichLuy { get; set; }
    public string? NgaySinh { get; set; }
}
