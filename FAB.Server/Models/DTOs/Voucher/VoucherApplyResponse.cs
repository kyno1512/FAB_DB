namespace FAB.Server.Models.DTOs.Voucher;

public class VoucherApplyResponse
{
    public int MaVoucher { get; set; }
    public string MaCode { get; set; } = string.Empty;
    public string TenVoucher { get; set; } = string.Empty;
    public decimal SoTienGiam { get; set; }
    public decimal TongThanhToan { get; set; }
}
