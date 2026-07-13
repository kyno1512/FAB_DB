namespace FAB.Server.Models.DTOs.Cart;

public class CartItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Image { get; set; } = string.Empty;
    public int Qty { get; set; }
    public int? SizeId { get; set; }
    public string? SizeName { get; set; }
    public string? CategoryName { get; set; }
}
