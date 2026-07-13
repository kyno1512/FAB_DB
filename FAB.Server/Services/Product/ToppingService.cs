using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Product;

/// <summary>Service đọc danh sách topping. Quy tắc: Xuất list = LINQ.</summary>
public class ToppingService : IToppingService
{
    private readonly FabDbContext _context;

    public ToppingService(FabDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy toàn bộ topping (có thể lọc chỉ topping đang bật).
    /// Xuất list = LINQ: Select project Entity → ToppingResponse ngay trong SQL.
    /// </summary>
    public async Task<ServiceResult<List<ToppingResponse>>> GetAllAsync(bool? activeOnly = null, CancellationToken ct = default)
    {
        var query = _context.Toppings.AsNoTracking().AsQueryable();

        if (activeOnly == true)
            query = query.Where(x => x.TrangThai);

        var items = await query
            .OrderBy(x => x.TenTopping)
            .Select(x => new ToppingResponse
            {
                MaTopping = x.MaTopping,
                TenTopping = x.TenTopping,
                Gia = x.Gia,
                TrangThai = x.TrangThai
            })
            .ToListAsync(ct);

        return ServiceResult<List<ToppingResponse>>.Ok(items);
    }
}
