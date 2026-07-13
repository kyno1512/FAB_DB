using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
[Route("api/admin/recipes")]
public class AdminRecipeController : ControllerBase
{
    private readonly IProductRecipeAdminService _recipeService;

    public AdminRecipeController(IProductRecipeAdminService recipeService)
    {
        _recipeService = recipeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? filter = null,
        CancellationToken ct = default)
    {
        var result = await _recipeService.GetPagedAsync(page, pageSize, search, filter, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var result = await _recipeService.GetStatsAsync(ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpGet("{maSanPham:int}")]
    public async Task<IActionResult> GetByProductId(int maSanPham, CancellationToken ct)
    {
        var result = await _recipeService.GetByProductIdAsync(maSanPham, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("{maSanPham:int}")]
    public async Task<IActionResult> Update(int maSanPham, [FromBody] UpdateProductRecipeRequest request, CancellationToken ct)
    {
        var result = await _recipeService.UpdateAsync(maSanPham, request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpDelete("{maSanPham:int}/{maCongThuc:int}")]
    public async Task<IActionResult> Delete(int maSanPham, int maCongThuc, CancellationToken ct)
    {
        var result = await _recipeService.DeleteAsync(maSanPham, maCongThuc, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }

    [HttpDelete("multiple")]
    public async Task<IActionResult> DeleteMultiple([FromBody] DeleteMultipleRecipesRequest request, CancellationToken ct)
    {
        var result = await _recipeService.DeleteMultipleAsync(request.MaCongThucIds, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }
}
