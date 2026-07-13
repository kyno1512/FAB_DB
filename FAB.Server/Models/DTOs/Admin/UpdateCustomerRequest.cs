namespace FAB.Server.Models.DTOs;

public class UpdateCustomerRequest
{
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public int DiemTichLuy { get; set; }
    public bool TrangThai { get; set; }
    public string? Password { get; set; }
}
