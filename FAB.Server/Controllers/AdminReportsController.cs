using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
[Route("api/admin/reports")]
public class AdminReportsController : ControllerBase
{
    private readonly IReportsAdminService _reportsService;

    public AdminReportsController(IReportsAdminService reportsService)
    {
        _reportsService = reportsService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? groupBy,
        CancellationToken ct)
    {
        var result = await _reportsService.GetOverviewAsync(from, to, groupBy, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }
}
