using FAB.Server.Context;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Infrastructure;

public static class OrderSchemaInitializer
{
    public static async Task EnsureAsync(FabDbContext context, CancellationToken ct = default)
    {
        const string addTrackingTokenSql = """
            IF COL_LENGTH('dbo.DonHang', 'TrackingToken') IS NULL
            BEGIN
                ALTER TABLE dbo.DonHang ADD TrackingToken NVARCHAR(64) NULL;
            END
            """;

        await context.Database.ExecuteSqlRawAsync(addTrackingTokenSql, ct);

        const string addTrackingTokenIndexSql = """
            IF NOT EXISTS (
                SELECT 1
                FROM sys.indexes
                WHERE name = 'IX_DonHang_TrackingToken'
                  AND object_id = OBJECT_ID('dbo.DonHang')
            )
            BEGIN
                EXEC(N'
                    SET QUOTED_IDENTIFIER ON;
                    CREATE UNIQUE INDEX IX_DonHang_TrackingToken
                        ON dbo.DonHang(TrackingToken)
                        WHERE TrackingToken IS NOT NULL;
                ');
            END
            """;

        await context.Database.ExecuteSqlRawAsync(addTrackingTokenIndexSql, ct);
    }
}
