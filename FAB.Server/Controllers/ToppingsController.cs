using FAB.Server.Services.Product;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/toppings")]
public class ToppingsController : ControllerBase
{
    private readonly IToppingService _toppingService;

    public ToppingsController(IToppingService toppingService)
    {
        _toppingService = toppingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly, CancellationToken cancellationToken)
    {
        var result = await _toppingService.GetAllAsync(activeOnly, cancellationToken);
        return Ok(result.Data);
    }
}
