using FAB.Server.Services.Product;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class SizesController : ControllerBase
{
    private readonly ISizeService _sizeService;

    public SizesController(ISizeService sizeService)
    {
        _sizeService = sizeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSizes(CancellationToken ct)
    {
        var sizes = await _sizeService.GetAllSizesAsync(ct);
        return Ok(sizes);
    }
}
