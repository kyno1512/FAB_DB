using FAB.Server.Context;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Infrastructure;

public static class InventorySchemaInitializer
{
    public static async Task EnsureAsync(FabDbContext context, CancellationToken ct = default)
    {
        const string addExpiryEndColumnSql = """
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('ChiTietPhieuNhapKho') AND name = 'HanSuDungDen'
            )
            BEGIN
                ALTER TABLE ChiTietPhieuNhapKho ADD HanSuDungDen DATE NULL;
            END
            """;

        await context.Database.ExecuteSqlRawAsync(addExpiryEndColumnSql, ct);
    }
}
