using FAB.Server.Services.Product;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/admin/sizes")]
[Authorize]
public class AdminSizesController : ControllerBase
{
    private readonly ISizeService _sizeService;

    public AdminSizesController(ISizeService sizeService)
    {
        _sizeService = sizeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSizes(CancellationToken ct)
    {
        var sizes = await _sizeService.GetAllSizesAsync(ct);
        return Ok(sizes);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSize([FromBody] CreateSizeRequest request, CancellationToken ct)
    {
        var result = await _sizeService.CreateSizeAsync(request.TenSize, request.HeSoGia, request.ThuTu, ct);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSize(int id, [FromBody] UpdateSizeRequest request, CancellationToken ct)
    {
        var result = await _sizeService.UpdateSizeAsync(id, request.TenSize, request.HeSoGia, request.ThuTu, request.TrangThai, ct);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSize(int id, CancellationToken ct)
    {
        await _sizeService.DeleteSizeAsync(id, ct);
        return Ok(new { message = "Xóa size thành công" });
    }
}

public class CreateSizeRequest
{
    public string TenSize { get; set; } = "";
    public decimal HeSoGia { get; set; }
    public int ThuTu { get; set; }
}

public class UpdateSizeRequest
{
    public string TenSize { get; set; } = "";
    public decimal HeSoGia { get; set; }
    public int ThuTu { get; set; }
    public bool TrangThai { get; set; } = true;
}
