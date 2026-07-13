namespace FAB.Server.Models.DTOs;

public class ShipperListItemDto
{
    public int MaNguoiDung { get; set; }

    public string HoTen { get; set; } = string.Empty;

    public string? SoDienThoai { get; set; }

    public string TenVaiTro { get; set; } = string.Empty;
}
