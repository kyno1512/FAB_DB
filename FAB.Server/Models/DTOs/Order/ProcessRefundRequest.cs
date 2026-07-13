using System.ComponentModel.DataAnnotations;

namespace FAB.Server.Models.DTOs.Order;

public class ProcessRefundRequest
{
    [Range(0, double.MaxValue, ErrorMessage = "Số tiền hoàn phải >= 0.")]
    public decimal SoTienHoan { get; set; }

    [StringLength(100, ErrorMessage = "Mã giao dịch hoàn tối đa 100 ký tự.")]
    public string? MaGiaoDichHoan { get; set; }

    [StringLength(200, ErrorMessage = "Người xử lý tối đa 200 ký tự.")]
    public string? NguoiXuLyHoan { get; set; }

    [StringLength(500, ErrorMessage = "Ghi chú tối đa 500 ký tự.")]
    public string? GhiChu { get; set; }
}
