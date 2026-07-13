using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [Route("api/admin/customers")]
public class AdminCustomersController : ControllerBase
{
    private readonly ICustomerAdminService _customerService;

    public AdminCustomersController(ICustomerAdminService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _customerService.GetPagedAsync(page, pageSize, search, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await _customerService.GetByIdAsync(id, ct);
        if (!result.Success)
            return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerRequest request, CancellationToken ct)
    {
        var result = await _customerService.UpdateAsync(id, request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await _customerService.DeleteAsync(id, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }

    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteMany([FromBody] DeleteCustomersRequest request, CancellationToken ct)
    {
        var result = await _customerService.DeleteManyAsync(request.Ids, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }

    [HttpPut("{id:int}/password")]
    public async Task<IActionResult> ResetPassword(
        int id, [FromBody] AdminResetPasswordRequest request, CancellationToken ct)
    {
        var result = await _customerService.ResetPasswordAsync(id, request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }
}
