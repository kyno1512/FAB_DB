namespace FAB.Server.Models.DTOs;

public class CreateOrderRequest
{
    public int? MaNguoiDung { get; set; }
    public string? HoTen { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public string? GhiChu { get; set; }

    // COD hoặc VNPay
    public string PhuongThucThanhToan { get; set; } = "COD";

    public string? MaCode { get; set; }

    public List<OrderItemRequest> Items { get; set; } = [];
}
