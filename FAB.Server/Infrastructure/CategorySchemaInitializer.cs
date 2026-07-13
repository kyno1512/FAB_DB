using FAB.Server.Context;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Infrastructure;

public static class CategorySchemaInitializer
{
    public static async Task EnsureAsync(FabDbContext context, CancellationToken ct = default)
    {
        // Set CoSize = 0 for Bánh categories (no size selection for bakery items)
        const string fixCoSizeSql = """
            UPDATE DanhMuc SET CoSize = 0 WHERE TenDanhMuc LIKE N'Bánh%' OR TenDanhMuc IN (N'Combo');
            """;
        await context.Database.ExecuteSqlRawAsync(fixCoSizeSql, ct);
    }
}
