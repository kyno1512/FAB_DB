using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FAB.Server.Common;
using FAB.Server.Models.DTOs.Inventory;
using FAB.Server.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [Route("api/admin/inventory")]
public class AdminInventoryController : ControllerBase
{
    private readonly IInventoryAdminService _inventoryService;

    public AdminInventoryController(IInventoryAdminService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, CancellationToken ct)
    {
        var result = await _inventoryService.GetAllAsync(search, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetList(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _inventoryService.GetListAsync(search, page, pageSize, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? new InventoryItemListDto());
    }

    [HttpGet("all-for-select")]
    public async Task<IActionResult> GetAllForSelect(CancellationToken ct = default)
    {
        var result = await _inventoryService.GetAllForSelectAsync(ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpGet("{id:int}/history")]
    public async Task<IActionResult> GetHistory(int id, CancellationToken ct)
    {
        var result = await _inventoryService.GetHistoryAsync(id, ct);
        if (!result.Success)
            return NotFound(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpGet("materials/{maNguyenLieu:int}/batches")]
    public async Task<IActionResult> GetBatches(int maNguyenLieu, CancellationToken ct)
    {
        var result = await _inventoryService.GetBatchesByMaterialAsync(maNguyenLieu, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpGet("materials/{maNguyenLieu:int}/recipes")]
    public async Task<IActionResult> GetRecipes(int maNguyenLieu, CancellationToken ct)
    {
        var result = await _inventoryService.GetRecipesByMaterialAsync(maNguyenLieu, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    // ==================== QUẢN LÝ LÔ ====================

    [HttpGet("materials/{maNguyenLieu:int}/los")]
    public async Task<IActionResult> GetLos(int maNguyenLieu, CancellationToken ct)
    {
        var result = await _inventoryService.GetLosByMaterialAsync(maNguyenLieu, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpPost("los")]
    public async Task<IActionResult> CreateLo([FromBody] CreateLoRequest request, CancellationToken ct)
    {
        var result = await _inventoryService.CreateLoAsync(request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("los/{id:int}")]
    public async Task<IActionResult> UpdateLo(int id, [FromBody] UpdateLoRequest request, CancellationToken ct)
    {
        var result = await _inventoryService.UpdateLoAsync(id, request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpDelete("los/{id:int}")]
    public async Task<IActionResult> DeleteLo(int id, CancellationToken ct)
    {
        var result = await _inventoryService.DeleteLoAsync(id, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = "Đã xóa lô thành công." });
    }

    [HttpPost("import-receipts-with-batch")]
    public async Task<IActionResult> CreateImportReceiptWithBatch([FromBody] CreateImportReceiptWithBatchRequest request, CancellationToken ct)
    {
        var userId = ResolveUserId();
        if (userId is null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        var result = await _inventoryService.CreateImportReceiptWithBatchAsync(request, userId.Value, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost("export-receipts-fifo")]
    public async Task<IActionResult> CreateExportReceiptFIFO([FromBody] CreateExportReceiptRequest request, CancellationToken ct)
    {
        var userId = ResolveUserId();
        if (userId is null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        var result = await _inventoryService.CreateExportReceiptFIFOAsync(request, userId.Value, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpGet("movements")]
    public async Task<IActionResult> GetRecentMovements(
        [FromQuery] int limit = 100,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? search = null,
        [FromQuery] string? loai = null,
        CancellationToken ct = default)
    {
        var result = await _inventoryService.GetRecentMovementsAsync(limit, from, to, search, loai, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpDelete("movements")]
    public async Task<IActionResult> DeleteMovements([FromBody] DeleteMovementsRequest request, CancellationToken ct)
    {
        var result = await _inventoryService.DeleteMovementsAsync(request.Ids, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(new { deleted = result.Data, message = $"Đã xóa {result.Data} bản ghi." });
    }

    [HttpGet("import-receipts")]
    public async Task<IActionResult> GetImportReceipts([FromQuery] int limit = 100, CancellationToken ct = default)
    {
        var result = await _inventoryService.GetImportReceiptsAsync(limit, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpGet("export-receipts")]
    public async Task<IActionResult> GetExportReceipts([FromQuery] int limit = 100, CancellationToken ct = default)
    {
        var result = await _inventoryService.GetExportReceiptsAsync(limit, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpPost("import-receipts")]
    public async Task<IActionResult> CreateImportReceipt([FromBody] CreateImportReceiptRequest request, CancellationToken ct)
    {
        var userId = ResolveUserId();
        if (userId is null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        var result = await _inventoryService.CreateImportReceiptAsync(request, userId.Value, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost("export-receipts")]
    public async Task<IActionResult> CreateExportReceipt([FromBody] CreateExportReceiptRequest request, CancellationToken ct)
    {
        var userId = ResolveUserId();
        if (userId is null)
            return Unauthorized(new { message = "Không xác định được người dùng." });

        var result = await _inventoryService.CreateExportReceiptAsync(request, userId.Value, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInventoryRequest request, CancellationToken ct)
    {
        var result = await _inventoryService.CreateAsync(request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInventoryRequest request, CancellationToken ct)
    {
        var result = await _inventoryService.UpdateAsync(id, request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost("{id:int}/adjust")]
    public async Task<IActionResult> Adjust(int id, [FromBody] AdjustInventoryRequest request, CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int? userId = int.TryParse(userIdClaim, out var parsed) ? parsed : null;

        var result = await _inventoryService.AdjustStockAsync(id, request, userId, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        try
        {
            var result = await _inventoryService.DeleteAsync(id, ct);
            if (!result.Success)
                return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Xóa thất bại: {ex.Message}" });
        }
    }

    private int? ResolveUserId()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var parsed) ? parsed : null;
    }
}
