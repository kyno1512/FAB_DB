namespace FAB.Server.Models.DTOs.Order;

public class RefundHistoryDto
{
    public int MaLichSu { get; set; }
    public int MaDonHang { get; set; }
    public string HoTenNguoiXuLy { get; set; } = string.Empty;
    public decimal SoTienHoan { get; set; }
    public string? MaGiaoDichHoan { get; set; }
    public string? GhiChu { get; set; }
    public DateTime NgayXuLy { get; set; }
}
