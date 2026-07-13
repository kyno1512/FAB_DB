namespace FAB.Server.Models.DTOs;

public class AdminOrderDetailResponse
{
    public int MaDonHang { get; set; }
    public string? TenKhachHang { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string LoaiDonHang { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public decimal TongTamTinh { get; set; }
    public decimal SoTienGiam { get; set; }
    public decimal TongThanhToan { get; set; }
    public string? GhiChu { get; set; }
    public DateTime NgayTao { get; set; }

    // Chi tiết sản phẩm
    public List<OrderDetailItemDto> Items { get; set; } = [];

    // Thông tin giao hàng
    public OrderDeliveryDto? GiaoHang { get; set; }

    // Hóa đơn
    public string? SoHoaDon { get; set; }
    public string? TrangThaiThanhToan { get; set; }
    public string PhuongThucThanhToan { get; set; } = string.Empty;

    // === Thông tin hủy / hoàn tiền ===
    public bool? YeuCauHuy { get; set; }
    public string? TrangThaiHuy { get; set; }
    public string? LyDoHuy { get; set; }
    public DateTime? NgayYeuCauHuy { get; set; }
    public decimal? SoTienHoan { get; set; }
    public DateTime? NgayHoanTien { get; set; }
    public string? MaGiaoDichHoan { get; set; }
    public string? NguoiXuLyHoan { get; set; }
}

public class OrderDetailItemDto
{
    public int MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    public int SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }
}

public class OrderDeliveryDto
{
    public int MaGiaoHang { get; set; }
    public string DiaChiGiao { get; set; } = string.Empty;
    public string NguoiNhan { get; set; } = string.Empty;
    public string SDTNguoiNhan { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public decimal PhiGiaoHang { get; set; }
    public string? GhiChu { get; set; }
    public DateTime? NgayGiao { get; set; }
    public int? MaShipper { get; set; }
    public string? TenShipper { get; set; }
}
