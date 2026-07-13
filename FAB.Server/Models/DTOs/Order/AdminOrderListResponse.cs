namespace FAB.Server.Models.DTOs;

public class AdminOrderListResponse
{
    public int MaDonHang { get; set; }
    public string? TenKhachHang { get; set; }
    public string? SoDienThoai { get; set; }
    public string LoaiDonHang { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public decimal TongThanhToan { get; set; }
    public string? GhiChu { get; set; }
    public DateTime NgayTao { get; set; }
    public int SoMon { get; set; }

    /// <summary>COD hoặc VNPAY</summary>
    public string PhuongThucThanhToan { get; set; } = string.Empty;

    public string? TrangThaiThanhToan { get; set; }

    // Thông tin giao hàng (nếu có)
    public string? DiaChiGiao { get; set; }
    public string? NguoiNhan { get; set; }
    public string? SDTNguoiNhan { get; set; }
    public string? TrangThaiGiao { get; set; }

    public string? TenShipper { get; set; }

    /// <summary>Chi tiết món trong đơn (dùng cho dropdown trên danh sách).</summary>
    public List<OrderDetailItemDto> Items { get; set; } = [];

    // === Thông tin hủy / hoàn tiền ===
    public bool? YeuCauHuy { get; set; }
    public string? TrangThaiHuy { get; set; }
    public string? LyDoHuy { get; set; }
    public DateTime? NgayYeuCauHuy { get; set; }
    public decimal? SoTienHoan { get; set; }
    public DateTime? NgayHoanTien { get; set; }
}
