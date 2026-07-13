namespace FAB.Server.Models.DTOs;

public class UpdateOrderStatusRequest
{
    public string TrangThai { get; set; } = string.Empty;

    /// <summary>Bắt buộc khi chuyển sang DangGiao (giao hàng).</summary>
    public int? MaShipper { get; set; }

    /// <summary>Phí giao hàng (VND) — khi duyệt giao.</summary>
    public decimal? PhiGiaoHang { get; set; }

    /// <summary>Ghi chú cho shipper (tuỳ chọn).</summary>
    public string? GhiChuGiao { get; set; }
}
