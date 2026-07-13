using FAB.Server.Common;
using FAB.Server.Models.DTOs.News;
using FAB.Server.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
[Route("api/admin/news")]
public class AdminNewsController : ControllerBase
{
    private readonly INewsAdminService _newsService;

    public AdminNewsController(INewsAdminService newsService)
    {
        _newsService = newsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, CancellationToken ct)
    {
        var result = await _newsService.GetAllAsync(search, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data ?? []);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await _newsService.GetByIdAsync(id, ct);
        if (!result.Success)
            return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertNewsRequest request, CancellationToken ct)
    {
        var result = await _newsService.CreateAsync(request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertNewsRequest request, CancellationToken ct)
    {
        var result = await _newsService.UpdateAsync(id, request, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var result = await _newsService.DeleteAsync(id, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMany([FromBody] DeleteNewsRequest request, CancellationToken ct)
    {
        var result = await _newsService.DeleteManyAsync(request.Ids, ct);
        if (!result.Success)
            return BadRequest(new { message = result.Error });
        return Ok(new { deleted = result.Data });
    }
}

public class DeleteNewsRequest
{
    public List<int> Ids { get; set; } = [];
}
