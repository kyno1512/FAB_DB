namespace FAB.Server.Models.DTOs.Voucher;

public class VoucherListItemDto
{
    public int MaVoucher { get; set; }
    public string TenVoucher { get; set; } = string.Empty;
    public string MaCode { get; set; } = string.Empty;
    public string LoaiGiam { get; set; } = string.Empty;
    public decimal GiaTri { get; set; }
    public decimal? GiamToiDa { get; set; }
    public decimal DieuKienToiThieu { get; set; }
    public int? SoLuongToiDa { get; set; }
    public int DaDung { get; set; }
    public bool GioiHanMotEmail { get; set; }
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public bool TrangThai { get; set; }
}
