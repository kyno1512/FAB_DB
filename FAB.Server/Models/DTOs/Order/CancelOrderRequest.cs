using System.ComponentModel.DataAnnotations;

namespace FAB.Server.Models.DTOs.Order;

public class CancelOrderRequest
{
    [Required(ErrorMessage = "Lý do hủy không được trống.")]
    [StringLength(500, ErrorMessage = "Lý do hủy tối đa 500 ký tự.")]
    public string LyDoHuy { get; set; } = string.Empty;
}
