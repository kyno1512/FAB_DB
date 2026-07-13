namespace FAB.Server.Models.DTOs;

public class UpdateCustomerInfoRequest
{
    public string SoDienThoai { get; set; } = string.Empty;
    public string? Email { get; set; }
}
