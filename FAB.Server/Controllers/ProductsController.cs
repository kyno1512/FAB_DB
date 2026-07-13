using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Services.Inventory;
using FAB.Server.Services.Product;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly ISanPhamService _sanPhamService;
    private readonly IProductReviewService _reviewService;
    private readonly IOrderInventoryService _orderInventoryService;

    public ProductsController(
        ISanPhamService sanPhamService,
        IProductReviewService reviewService,
        IOrderInventoryService orderInventoryService)
    {
        _sanPhamService = sanPhamService;
        _reviewService = reviewService;
        _orderInventoryService = orderInventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? maDanhMuc = null,
        [FromQuery] bool? trangThai = null,
        [FromQuery] string? sort = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sanPhamService.GetPagedAsync(
            page, pageSize, search, maDanhMuc, trangThai, sort, cancellationToken);

        return Ok(result.Data);
    }

    [HttpGet("search-tags")]
    public async Task<IActionResult> GetSearchTags(CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.GetSearchTagsAsync(cancellationToken);
        return Ok(result.Data);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.GetByIdAsync(id, cancellationToken);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    [HttpPost("check-stock")]
    public async Task<IActionResult> CheckStock([FromBody] Models.DTOs.Product.CheckStockRequest request, CancellationToken cancellationToken)
    {
        if (request.Lines == null || request.Lines.Count == 0)
            return Ok(new Models.DTOs.Product.CheckStockResponse { Success = true, Message = string.Empty });

        var lines = request.Lines.Select(x => new OrderInventoryLine(x.MaSanPham, x.SoLuong)).ToList();
        var result = await _orderInventoryService.CheckStockAsync(lines, cancellationToken);

        return Ok(new Models.DTOs.Product.CheckStockResponse
        {
            Success = result.Success,
            Message = result.Message,
            BottleneckIngredient = result.BottleneckIngredient,
            MaxAvailable = result.MaxAvailable
        });
    }

    [HttpGet("max-available/{id:int}")]
    public async Task<IActionResult> GetMaxAvailable(int id, CancellationToken cancellationToken)
    {
        var max = await _orderInventoryService.GetMaxAvailableAsync(id, cancellationToken);
        return Ok(new { maSanPham = id, maxAvailable = max });
    }

    [HttpPost("max-available/batch")]
    public async Task<IActionResult> GetMaxAvailableBatch([FromBody] List<int> ids, CancellationToken cancellationToken)
    {
        if (ids == null || ids.Count == 0)
            return Ok(new { });

        var result = await _orderInventoryService.GetMaxAvailableBatchAsync(ids, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}/reviews")]
    public async Task<IActionResult> GetReviews(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _reviewService.GetByProductAsync(id, page, pageSize, cancellationToken);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    [HttpPost("{id:int}/reviews")]
    public async Task<IActionResult> CreateReview(
        int id,
        [FromBody] CreateProductReviewRequest request,
        CancellationToken cancellationToken = default)
    {
        int? maNguoiDung = null;

        if (User.Identity?.IsAuthenticated == true)
        {
            var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userId, out var parsedId))
                maNguoiDung = parsedId;
        }

        var result = await _reviewService.CreateAsync(id, maNguoiDung, request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SanPhamCreateRequest request, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.CreateAsync(request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SanPhamUpdateRequest request, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.UpdateAsync(id, request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPut("{id:int}/hot-deal")]
    public async Task<IActionResult> ApplyHotDeal(
        int id, [FromBody] ApplyHotDealRequest request, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.ApplyHotDealAsync(id, request.PhanTramGiam, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpDelete("{id:int}/hot-deal")]
    public async Task<IActionResult> RemoveHotDeal(int id, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.RemoveHotDealAsync(id, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.DeleteAsync(id, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}
