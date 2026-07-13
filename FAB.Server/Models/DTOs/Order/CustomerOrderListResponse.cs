namespace FAB.Server.Models.DTOs;

public class CustomerOrderListResponse
{
    public int MaDonHang { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public decimal TongThanhToan { get; set; }
    public DateTime NgayTao { get; set; }
    public int SoMon { get; set; }
    public string PhuongThucThanhToan { get; set; } = string.Empty;
    public string? TrangThaiThanhToan { get; set; }
    public string? DiaChiGiao { get; set; }
    public string? NguoiNhan { get; set; }

    // === Thông tin hủy / hoàn tiền ===
    public bool? YeuCauHuy { get; set; }
    public string? TrangThaiHuy { get; set; }
    public string? LyDoHuy { get; set; }
    public DateTime? NgayYeuCauHuy { get; set; }
    public decimal? SoTienHoan { get; set; }
    public DateTime? NgayHoanTien { get; set; }
}
