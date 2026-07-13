using FAB.Server.Context;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Infrastructure;

public static class SizeSchemaInitializer
{
    public static async Task EnsureAsync(FabDbContext context, CancellationToken ct = default)
    {
        // Seed default sizes if they don't exist
        const string seedSizesSql = """
            IF NOT EXISTS (SELECT 1 FROM Size WHERE MaSize = 1)
            BEGIN
                INSERT INTO Size (MaSize, TenSize, HeSoGia, ThuTu) VALUES (1, N'Nhỏ (S)', 0.85, 1);
            END
            IF NOT EXISTS (SELECT 1 FROM Size WHERE MaSize = 2)
            BEGIN
                INSERT INTO Size (MaSize, TenSize, HeSoGia, ThuTu) VALUES (2, N'Vừa (M)', 1.0, 2);
            END
            IF NOT EXISTS (SELECT 1 FROM Size WHERE MaSize = 3)
            BEGIN
                INSERT INTO Size (MaSize, TenSize, HeSoGia, ThuTu) VALUES (3, N'Lớn (L)', 1.15, 3);
            END
            """;

        await context.Database.ExecuteSqlRawAsync(seedSizesSql, ct);

        // Ensure CoSize column exists in DanhMuc (from migration 20260704040000)
        const string ensureCoSizeSql = """
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('DanhMuc') AND name = 'CoSize'
            )
            BEGIN
                ALTER TABLE DanhMuc ADD CoSize BIT NOT NULL CONSTRAINT DF_DanhMuc_CoSize DEFAULT 1;
            END
            """;

        try
        {
            await context.Database.ExecuteSqlRawAsync(ensureCoSizeSql, ct);
        }
        catch
        {
            // Column might already exist with different constraint
        }

        // Update DanhMuc to have CoSize = true for existing categories
        const string updateDanhMucCoSizeSql = """
            UPDATE DanhMuc SET CoSize = 1 WHERE CoSize IS NULL OR CoSize = 0;
            """;

        try
        {
            await context.Database.ExecuteSqlRawAsync(updateDanhMucCoSizeSql, ct);
        }
        catch
        {
            // Ignore if column doesn't exist yet
        }

        // Ensure MaSize column exists in ChiTietGioHang
        const string ensureMaSizeInCartSql = """
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('ChiTietGioHang') AND name = 'MaSize'
            )
            BEGIN
                ALTER TABLE ChiTietGioHang ADD MaSize INT NULL;
            END
            """;

        try
        {
            await context.Database.ExecuteSqlRawAsync(ensureMaSizeInCartSql, ct);
        }
        catch
        {
            // Column might already exist
        }

        // Ensure TrangThai column exists in Size table
        const string ensureSizeTrangThaiSql = """
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID('Size') AND name = 'TrangThai'
            )
            BEGIN
                ALTER TABLE Size ADD TrangThai BIT NOT NULL DEFAULT 1;
            END
            """;

        try
        {
            await context.Database.ExecuteSqlRawAsync(ensureSizeTrangThaiSql, ct);
        }
        catch
        {
            // Column might already exist
        }

        // Ensure foreign key constraint exists
        const string ensureFkSql = """
            IF NOT EXISTS (
                SELECT 1 FROM sys.foreign_keys
                WHERE name = 'FK__ChiTietGioHang__MaSize'
            )
            BEGIN
                ALTER TABLE ChiTietGioHang
                ADD CONSTRAINT FK__ChiTietGioHang__MaSize
                FOREIGN KEY (MaSize) REFERENCES Size(MaSize)
                ON DELETE SET NULL;
            END
            """;

        try
        {
            await context.Database.ExecuteSqlRawAsync(ensureFkSql, ct);
        }
        catch
        {
            // Constraint might already exist
        }

        // Seed default prices for products that don't have size pricing yet
        const string seedProductPricesSql = """
            INSERT INTO GiaSanPhamTheoSize (MaSanPham, MaSize, Gia)
            SELECT s.MaSanPham, sz.MaSize, CAST(s.GiaBan * sz.HeSoGia AS DECIMAL(18, 0))
            FROM SanPham s
            CROSS JOIN Size sz
            WHERE NOT EXISTS (
                SELECT 1 FROM GiaSanPhamTheoSize g
                WHERE g.MaSanPham = s.MaSanPham AND g.MaSize = sz.MaSize
            );
            """;

        await context.Database.ExecuteSqlRawAsync(seedProductPricesSql, ct);
    }
}
