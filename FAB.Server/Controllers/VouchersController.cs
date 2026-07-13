using FAB.Server.Common;
using FAB.Server.Models.DTOs.Voucher;
using FAB.Server.Services.Voucher;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/vouchers")]
public class VouchersController : ControllerBase
{
    private readonly IVoucherService _voucherService;

    public VouchersController(IVoucherService voucherService)
    {
        _voucherService = voucherService;
    }

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidateVoucherRequest request, CancellationToken ct)
    {
        var result = await _voucherService.ValidateAsync(request.MaCode, request.Subtotal, request.Email, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _voucherService.GetAllAsync(ct);

        if (!result.Success)
            return StatusCode(500, new { message = result.Error ?? "Không tải được danh sách mã khuyến mãi." });

        return Ok(result.Data ?? []);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVoucherRequest request, CancellationToken ct)
    {
        var result = await _voucherService.CreateAsync(request, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVoucherRequest request, CancellationToken ct)
    {
        var result = await _voucherService.UpdateAsync(id, request, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await _voucherService.DeleteAsync(id, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}
