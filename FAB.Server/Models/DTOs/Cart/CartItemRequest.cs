namespace FAB.Server.Models.DTOs.Cart;

public class CartItemRequest
{
    public int ProductId { get; set; }
    public int Qty { get; set; }
    public int? SizeId { get; set; }
}
