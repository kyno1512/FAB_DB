using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FAB.Server.Models.DTOs.Cart;
using FAB.Server.Services.Cart;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GioHangController : ControllerBase
{
    private readonly IGioHangService _gioHangService;

    public GioHangController(IGioHangService gioHangService)
    {
        _gioHangService = gioHangService;
    }

    [HttpGet("{userId:int}")]
    public async Task<IActionResult> GetCart(int userId)
    {
        var cart = await _gioHangService.GetCartAsync(userId);
        return Ok(cart);
    }

    [HttpPost("{userId:int}/add")]
    public async Task<IActionResult> AddToCart(int userId, [FromBody] CartItemRequest request)
    {
        var cart = await _gioHangService.AddToCartAsync(userId, request.ProductId, request.Qty, request.SizeId);
        return Ok(cart);
    }

    [HttpPut("{userId:int}/update")]
    public async Task<IActionResult> UpdateCartItem(int userId, [FromBody] CartItemRequest request)
    {
        var cart = await _gioHangService.UpdateCartItemAsync(userId, request.ProductId, request.Qty, request.SizeId);
        return Ok(cart);
    }

    [HttpDelete("{userId:int}/remove/{productId:int}")]
    public async Task<IActionResult> RemoveFromCart(int userId, int productId, [FromQuery] int? sizeId = null)
    {
        var cart = await _gioHangService.RemoveFromCartAsync(userId, productId, sizeId);
        return Ok(cart);
    }

    [HttpPost("{userId:int}/sync")]
    public async Task<IActionResult> SyncCart(int userId, [FromBody] SyncCartRequest request)
    {
        var cart = await _gioHangService.SyncCartAsync(userId, request.Items);
        return Ok(cart);
    }

    [HttpDelete("{userId:int}/clear")]
    public async Task<IActionResult> ClearCart(int userId)
    {
        await _gioHangService.ClearCartAsync(userId);
        return Ok(new { message = "Cart cleared" });
    }
}
