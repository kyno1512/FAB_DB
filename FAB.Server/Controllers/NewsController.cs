using FAB.Server.Context;
using FAB.Server.Models.DTOs.News;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController : ControllerBase
{
    private readonly FabDbContext _context;

    public NewsController(FabDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublished(CancellationToken ct)
    {
        var rows = await _context.TinTucs
            .AsNoTracking()
            .Where(x => x.TrangThai == "DangDang")
            .OrderByDescending(x => x.NgayDang)
            .ToListAsync(ct);

        return Ok(rows.Select(NewsMapper.ToDto));
    }
}
