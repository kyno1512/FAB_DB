using FAB.Server.Context;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Infrastructure;

public static class ReviewSchemaInitializer
{
    public static async Task EnsureAsync(FabDbContext context, CancellationToken ct = default)
    {
        const string createTableSql = """
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'DanhGiaSanPham')
            BEGIN
                CREATE TABLE DanhGiaSanPham (
                    MaDanhGia    INT IDENTITY(1,1) PRIMARY KEY,
                    MaSanPham    INT               NOT NULL,
                    MaNguoiDung  INT               NULL,
                    HoTenKhach   NVARCHAR(100)     NULL,
                    Diem         TINYINT           NOT NULL CHECK (Diem BETWEEN 1 AND 5),
                    NoiDung      NVARCHAR(1000)    NOT NULL,
                    TrangThai    BIT               NOT NULL DEFAULT 1,
                    NgayTao      DATETIME          NOT NULL DEFAULT GETDATE(),
                    CONSTRAINT FK_DanhGiaSanPham_SanPham FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham) ON DELETE CASCADE,
                    CONSTRAINT FK_DanhGiaSanPham_NguoiDung FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE
                );

                CREATE INDEX IX_DanhGiaSanPham_MaSanPham ON DanhGiaSanPham(MaSanPham);
            END
            """;

        await context.Database.ExecuteSqlRawAsync(createTableSql, ct);

        const string addGuestColumnSql = """
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('DanhGiaSanPham') AND name = 'HoTenKhach'
            )
            BEGIN
                ALTER TABLE DanhGiaSanPham ADD HoTenKhach NVARCHAR(100) NULL;
            END
            """;

        await context.Database.ExecuteSqlRawAsync(addGuestColumnSql, ct);

        const string dropUniqueObjectsSql = """
            IF OBJECT_ID('DanhGiaSanPham', 'U') IS NOT NULL
            BEGIN
                DECLARE @dropSql NVARCHAR(MAX) = N'';

                SELECT @dropSql = @dropSql + N'ALTER TABLE DanhGiaSanPham DROP CONSTRAINT '
                    + QUOTENAME(kc.name) + N';' + CHAR(10)
                FROM sys.key_constraints kc
                WHERE kc.parent_object_id = OBJECT_ID(N'DanhGiaSanPham')
                  AND kc.type = N'UQ';

                SELECT @dropSql = @dropSql + N'DROP INDEX '
                    + QUOTENAME(i.name) + N' ON DanhGiaSanPham;' + CHAR(10)
                FROM sys.indexes i
                WHERE i.object_id = OBJECT_ID(N'DanhGiaSanPham')
                  AND i.is_unique = 1
                  AND i.is_primary_key = 0
                  AND i.name IS NOT NULL;

                IF LEN(@dropSql) > 0
                    EXEC sp_executesql @dropSql;
            END
            """;

        await context.Database.ExecuteSqlRawAsync(dropUniqueObjectsSql, ct);

        const string nullableUserSql = """
            IF EXISTS (
                SELECT 1
                FROM sys.columns
                WHERE object_id = OBJECT_ID('DanhGiaSanPham')
                  AND name = 'MaNguoiDung'
                  AND is_nullable = 0
            )
            BEGIN
                ALTER TABLE DanhGiaSanPham ALTER COLUMN MaNguoiDung INT NULL;
            END
            """;

        await context.Database.ExecuteSqlRawAsync(nullableUserSql, ct);

        const string addFilteredIndexSql = """
            IF OBJECT_ID('DanhGiaSanPham', 'U') IS NOT NULL
               AND NOT EXISTS (
                   SELECT 1
                   FROM sys.indexes
                   WHERE object_id = OBJECT_ID('DanhGiaSanPham')
                     AND name = 'UQ_DanhGiaSanPham_UserProduct_Filtered'
               )
            BEGIN
                CREATE UNIQUE INDEX UQ_DanhGiaSanPham_UserProduct_Filtered
                    ON DanhGiaSanPham(MaSanPham, MaNguoiDung)
                    WHERE MaNguoiDung IS NOT NULL;
            END
            """;

        await context.Database.ExecuteSqlRawAsync(addFilteredIndexSql, ct);
    }
}
