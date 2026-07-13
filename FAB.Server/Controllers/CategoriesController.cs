using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Services.Product;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly IDanhMucService _danhMucService;

    public CategoriesController(IDanhMucService danhMucService)
    {
        _danhMucService = danhMucService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly, CancellationToken cancellationToken)
    {
        var result = await _danhMucService.GetAllAsync(activeOnly, cancellationToken);
        return Ok(result.Data);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _danhMucService.GetByIdAsync(id, cancellationToken);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DanhMucRequest request, CancellationToken cancellationToken)
    {
        var result = await _danhMucService.CreateAsync(request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] DanhMucRequest request, CancellationToken cancellationToken)
    {
        var result = await _danhMucService.UpdateAsync(id, request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _danhMucService.DeleteAsync(id, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}
