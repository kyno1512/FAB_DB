using FAB.Server.Common;
using FAB.Server.Models.DTOs.SupplierDebt;
using FAB.Server.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
[Route("api/admin/supplier-debt")]
public class AdminSupplierDebtController : ControllerBase
{
    private readonly ISupplierDebtAdminService _service;

    public AdminSupplierDebtController(ISupplierDebtAdminService service)
    {
        _service = service;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var result = await _service.GetSummaryAsync(ct);
        if (!result.Success) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpGet("suppliers")]
    public async Task<IActionResult> GetSuppliers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _service.GetSuppliersAsync(page, pageSize, search, ct);
        if (!result.Success) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost("suppliers")]
    public async Task<IActionResult> CreateSupplier(
        [FromBody] UpsertSupplierRequest request, CancellationToken ct)
    {
        var result = await _service.CreateSupplierAsync(request, ct);
        if (!result.Success) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("suppliers/{id:int}")]
    public async Task<IActionResult> UpdateSupplier(
        int id, [FromBody] UpsertSupplierRequest request, CancellationToken ct)
    {
        var result = await _service.UpdateSupplierAsync(id, request, ct);
        if (!result.Success) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpDelete("suppliers/{id:int}")]
    public async Task<IActionResult> DeleteSupplier(int id, CancellationToken ct)
    {
        var result = await _service.DeleteSupplierAsync(id, ct);
        if (!result.Success) return BadRequest(new { message = result.Error });
        return Ok(new { message = result.Data });
    }

    [HttpGet("debts")]
    public async Task<IActionResult> GetDebts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? maNhaCungCap = null,
        [FromQuery] string? trangThaiThanhToan = null,
        CancellationToken ct = default)
    {
        var result = await _service.GetDebtsAsync(
            page, pageSize, search, maNhaCungCap, trangThaiThanhToan, ct);
        if (!result.Success) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost("debts/{id:int}/pay")]
    public async Task<IActionResult> RecordPayment(
        int id, [FromBody] RecordSupplierPaymentRequest request, CancellationToken ct)
    {
        var result = await _service.RecordPaymentAsync(id, request, ct);
        if (!result.Success) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("debts/{id:int}/assign-supplier")]
    public async Task<IActionResult> AssignSupplier(
        int id, [FromBody] AssignSupplierToReceiptRequest request, CancellationToken ct)
    {
        var result = await _service.AssignSupplierAsync(id, request, ct);
        if (!result.Success) return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }
}
