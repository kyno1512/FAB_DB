using FAB.Server.Context;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Infrastructure;

public static class VoucherSchemaInitializer
{
    public static async Task EnsureAsync(FabDbContext context, CancellationToken ct = default)
    {
        const string createTableSql = """
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'MaGiamGia')
            BEGIN
                CREATE TABLE MaGiamGia (
                    MaVoucher          INT IDENTITY(1,1) PRIMARY KEY,
                    TenVoucher         NVARCHAR(200)     NOT NULL,
                    MaCode             NVARCHAR(50)      NOT NULL,
                    LoaiGiam           NVARCHAR(20)      NOT NULL,
                    GiaTri             DECIMAL(18, 2)    NOT NULL,
                    GiamToiDa          DECIMAL(18, 2)    NULL,
                    DieuKienToiThieu   DECIMAL(18, 2)    NOT NULL DEFAULT 0,
                    SoLuongToiDa       INT               NULL,
                    DaDung             INT               NOT NULL DEFAULT 0,
                    NgayBatDau         DATETIME          NOT NULL,
                    NgayKetThuc        DATETIME          NOT NULL,
                    TrangThai          BIT               NOT NULL DEFAULT 1,
                    GioiHanMotEmail    BIT               NOT NULL DEFAULT 0,
                    CONSTRAINT UQ_MaGiamGia_MaCode UNIQUE (MaCode)
                );
            END
            """;

        await context.Database.ExecuteSqlRawAsync(createTableSql, ct);

        const string addEmailLimitColumnSql = """
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('MaGiamGia') AND name = 'GioiHanMotEmail'
            )
            BEGIN
                ALTER TABLE MaGiamGia ADD GioiHanMotEmail BIT NOT NULL CONSTRAINT DF_MaGiamGia_GioiHanMotEmail DEFAULT 0;
            END
            """;

        await context.Database.ExecuteSqlRawAsync(addEmailLimitColumnSql, ct);

        const string seedSampleSql = """
            IF NOT EXISTS (SELECT 1 FROM MaGiamGia WHERE MaCode = 'FLYGO10')
            BEGIN
                INSERT INTO MaGiamGia (
                    TenVoucher, MaCode, LoaiGiam, GiaTri, GiamToiDa, DieuKienToiThieu,
                    SoLuongToiDa, DaDung, NgayBatDau, NgayKetThuc, TrangThai, GioiHanMotEmail
                )
                VALUES (
                    N'Giảm 10% đơn Flygo', 'FLYGO10', N'PhanTram', 10, 50000, 100000,
                    1000, 0, DATEADD(DAY, -1, GETDATE()), DATEADD(MONTH, 6, GETDATE()), 1, 0
                );
            END
            """;

        await context.Database.ExecuteSqlRawAsync(seedSampleSql, ct);
    }
}
