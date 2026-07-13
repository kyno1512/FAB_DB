using System.Collections.Generic;

namespace FAB.Server.Models.DTOs.Cart;

public class SyncCartRequest
{
    public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
}
