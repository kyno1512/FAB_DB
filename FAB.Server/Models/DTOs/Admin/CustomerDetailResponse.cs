namespace FAB.Server.Models.DTOs;

public class CustomerDetailResponse
{
    public int MaKhachHang { get; set; }
    public int? MaNguoiDung { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public DateOnly? NgaySinh { get; set; }
    public int DiemTichLuy { get; set; }
    public bool CoTaiKhoan { get; set; }
    public bool TrangThai { get; set; }
    public int SoDonHang { get; set; }
    public DateTime NgayTao { get; set; }
    public string? MatKhau { get; set; }
}
