using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [Route("api/admin/staff")]
public class AdminStaffController : ControllerBase
{
    private readonly IStaffAdminService _staffService;

    public AdminStaffController(IStaffAdminService staffService)
    {
        _staffService = staffService;
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles(CancellationToken ct)
    {
        var result = await _staffService.GetRolesAsync(ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, CancellationToken ct)
    {
        var result = await _staffService.GetAllAsync(search, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await _staffService.GetByIdAsync(id, ct);
        if (!result.Success)
            return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStaffRequest request, CancellationToken ct)
    {
        var result = await _staffService.CreateAsync(request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffRequest request, CancellationToken ct)
    {
        var result = await _staffService.UpdateAsync(id, request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await _staffService.DeleteAsync(id, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }

    [HttpGet("{id:int}/modules")]
    public async Task<IActionResult> GetModulePermissions(int id, CancellationToken ct)
    {
        var result = await _staffService.GetModulePermissionsAsync(id, ct);
        if (!result.Success)
            return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("{id:int}/modules")]
    public async Task<IActionResult> UpdateModulePermissions(int id, [FromBody] UpdateStaffPermissionsRequest request, CancellationToken ct)
    {
        var result = await _staffService.UpdateModulePermissionsAsync(id, request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }
}
