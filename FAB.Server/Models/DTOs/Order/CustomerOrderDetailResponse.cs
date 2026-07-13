namespace FAB.Server.Models.DTOs;

public class CustomerOrderDetailResponse
{
    public int MaDonHang { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public decimal TongTamTinh { get; set; }
    public decimal SoTienGiam { get; set; }
    public decimal TongThanhToan { get; set; }
    public DateTime NgayTao { get; set; }

    // Chi tiết sản phẩm
    public List<OrderDetailItemDto> Items { get; set; } = [];

    // Thông tin giao hàng
    public OrderDeliveryDto? GiaoHang { get; set; }

    // Thanh toán
    public string PhuongThucThanhToan { get; set; } = string.Empty;
    public string? TrangThaiThanhToan { get; set; }

    // === Thông tin hủy / hoàn tiền ===
    public bool? YeuCauHuy { get; set; }
    public string? TrangThaiHuy { get; set; }
    public string? LyDoHuy { get; set; }
    public DateTime? NgayYeuCauHuy { get; set; }
    public decimal? SoTienHoan { get; set; }
    public DateTime? NgayHoanTien { get; set; }
    public string? MaGiaoDichHoan { get; set; }

    // === Thông tin liên hệ hoàn tiền (trả về cho khách) ===
    public string ZaloSoDienThoai { get; set; } = "0769472076";
    public string EmailHoTro { get; set; } = "support@flygo.vn";
}
