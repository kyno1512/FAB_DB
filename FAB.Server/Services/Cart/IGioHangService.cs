using System.Collections.Generic;
using System.Threading.Tasks;
using FAB.Server.Models.DTOs.Cart;

namespace FAB.Server.Services.Cart;

public interface IGioHangService
{
    Task<List<CartItemDto>> GetCartAsync(int userId);
    Task<List<CartItemDto>> AddToCartAsync(int userId, int productId, int qty, int? sizeId = null);
    Task<List<CartItemDto>> UpdateCartItemAsync(int userId, int productId, int qty, int? sizeId = null);
    Task<List<CartItemDto>> RemoveFromCartAsync(int userId, int productId, int? sizeId = null);
    Task<List<CartItemDto>> SyncCartAsync(int userId, List<CartItemDto> sessionItems);
    Task ClearCartAsync(int userId);
}
