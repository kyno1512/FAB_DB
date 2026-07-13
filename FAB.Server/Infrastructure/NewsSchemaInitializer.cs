using FAB.Server.Context;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Infrastructure;

public static class NewsSchemaInitializer
{
    public static async Task EnsureAsync(FabDbContext context, CancellationToken ct = default)
    {
        const string createTableSql = """
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TinTuc')
            BEGIN
                CREATE TABLE TinTuc (
                    MaTinTuc     INT IDENTITY(1,1) PRIMARY KEY,
                    TieuDe       NVARCHAR(250)  NOT NULL,
                    DanhMuc      NVARCHAR(100)  NOT NULL DEFAULT N'Tin tức',
                    TomTat       NVARCHAR(500)  NOT NULL,
                    NoiDung      NVARCHAR(MAX)  NULL,
                    AnhDaiDien   NVARCHAR(500)  NULL,
                    TrangThai    NVARCHAR(20)   NOT NULL DEFAULT N'Nhap',
                    NgayDang     DATETIME       NOT NULL DEFAULT GETDATE(),
                    NgayTao      DATETIME       NOT NULL DEFAULT GETDATE(),
                    NgayCapNhat  DATETIME       NULL
                );

                CREATE INDEX IX_TinTuc_TrangThai_NgayDang ON TinTuc(TrangThai, NgayDang DESC);
            END
            """;

        await context.Database.ExecuteSqlRawAsync(createTableSql, ct);

        const string addExtraImagesColumnSql = """
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('TinTuc') AND name = 'AnhPhu'
            )
            BEGIN
                ALTER TABLE TinTuc ADD AnhPhu NVARCHAR(MAX) NULL;
            END
            """;

        await context.Database.ExecuteSqlRawAsync(addExtraImagesColumnSql, ct);
    }
}
