-- ============================================================
-- TẠO BẢNG QUẢN LÝ LÔ NGUYÊN LIỆU
-- ============================================================

-- Bảng Lô (Batch)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Lo')
BEGIN
    CREATE TABLE Lo (
        MaLo INT IDENTITY(1,1) PRIMARY KEY,
        MaNguyenLieu INT NOT NULL,
        NgaySanXuat DATE NULL,
        HanSuDung DATE NOT NULL,
        SoLuongCon DECIMAL(18,3) NOT NULL DEFAULT 0,
        DonGia DECIMAL(18,2) NULL,
        NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
        GhiChu NVARCHAR(500) NULL,
        TrangThai NVARCHAR(20) NOT NULL DEFAULT N'ConHang',
        CONSTRAINT FK_Lo_NguyenLieu FOREIGN KEY (MaNguyenLieu) REFERENCES NguyenLieu(MaNguyenLieu) ON DELETE CASCADE
    );

    CREATE INDEX IX_Lo_MaNguyenLieu ON Lo(MaNguyenLieu);
    CREATE INDEX IX_Lo_HanSuDung ON Lo(HanSuDung) WHERE TrangThai = N'ConHang';
    CREATE INDEX IX_Lo_NgayTao ON Lo(NgayTao);
END
GO

-- Cập nhật bảng ChiTietPhieuNhapKho để liên kết với Lô
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ChiTietPhieuNhapKho') AND name = 'MaLo')
BEGIN
    ALTER TABLE ChiTietPhieuNhapKho ADD MaLo INT NULL;

    ALTER TABLE ChiTietPhieuNhapKho
    ADD CONSTRAINT FK_ChiTietPhieuNhapKho_Lo FOREIGN KEY (MaLo) REFERENCES Lo(MaLo) ON DELETE SET NULL;
END
GO

-- Cập nhật bảng ChiTietPhieuXuatKho để thêm DonGia
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ChiTietPhieuXuatKho') AND name = 'DonGia')
BEGIN
    ALTER TABLE ChiTietPhieuXuatKho ADD DonGia DECIMAL(18,2) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ChiTietPhieuXuatKho') AND name = 'MaLo')
BEGIN
    ALTER TABLE ChiTietPhieuXuatKho ADD MaLo INT NULL;

    ALTER TABLE ChiTietPhieuXuatKho
    ADD CONSTRAINT FK_ChiTietPhieuXuatKho_Lo FOREIGN KEY (MaLo) REFERENCES Lo(MaLo) ON DELETE SET NULL;
END
GO

-- ============================================================
-- VIEW: Xem danh sách lô của nguyên liệu (sắp xếp theo HSD - FIFO)
-- ============================================================
CREATE OR ALTER VIEW v_DanhSachLoNguyenLieu
AS
SELECT
    l.MaLo,
    l.MaNguyenLieu,
    nl.TenNguyenLieu,
    nl.DonVi,
    l.NgaySanXuat,
    l.HanSuDung,
    l.SoLuongCon,
    l.DonGia,
    l.NgayTao,
    l.GhiChu,
    l.TrangThai,
    DATEDIFF(DAY, GETDATE(), l.HanSuDung) AS SoNgayConLai,
    CASE
        WHEN l.TrangThai = N'HetHang' THEN N'Đã xuất hết'
        WHEN DATEDIFF(DAY, GETDATE(), l.HanSuDung) <= 0 THEN N'Hết hạn'
        WHEN DATEDIFF(DAY, GETDATE(), l.HanSuDung) <= 7 THEN N'Sắp hết hạn'
        WHEN l.SoLuongCon <= nl.MucTonToiThieu THEN N'Sắp hết hàng'
        ELSE N'Bình thường'
    END AS TinhTrang
FROM Lo l
INNER JOIN NguyenLieu nl ON l.MaNguyenLieu = nl.MaNguyenLieu;
GO

-- ============================================================
-- FUNCTION: Lấy danh sách lô theo FIFO
-- ============================================================
CREATE OR ALTER FUNCTION f_GetLoFIFO(@MaNguyenLieu INT)
RETURNS TABLE
AS
RETURN
(
    SELECT TOP(100)
        MaLo,
        SoLuongCon,
        DonGia
    FROM Lo
    WHERE MaNguyenLieu = @MaNguyenLieu
        AND TrangThai = N'ConHang'
        AND SoLuongCon > 0
        AND HanSuDung >= GETDATE()
    ORDER BY HanSuDung ASC
);
GO

-- ============================================================
-- SP: Tự động tạo lô mới khi nhập kho
-- ============================================================
CREATE OR ALTER PROCEDURE sp_TaoLoNhaphKho
    @MaNguyenLieu INT,
    @NgaySanXuat DATE,
    @HanSuDung DATE,
    @SoLuong DECIMAL(18,3),
    @DonGia DECIMAL(18,2),
    @GhiChu NVARCHAR(500),
    @MaLo INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO Lo (MaNguyenLieu, NgaySanXuat, HanSuDung, SoLuongCon, DonGia, NgayTao, GhiChu, TrangThai)
        VALUES (@MaNguyenLieu, @NgaySanXuat, @HanSuDung, @SoLuong, @DonGia, GETDATE(), @GhiChu, N'ConHang');

        SET @MaLo = SCOPE_IDENTITY();

        UPDATE NguyenLieu
        SET SoLuongTon = SoLuongTon + @SoLuong
        WHERE MaNguyenLieu = @MaNguyenLieu;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ============================================================
-- SP: Xuất kho theo FIFO
-- ============================================================
CREATE OR ALTER PROCEDURE sp_XuatKhoFIFO
    @MaNguyenLieu INT,
    @SoLuongCanXuat DECIMAL(18,3),
    @LyDoXuat NVARCHAR(500),
    @MaNguoiTao INT,
    @MaPhieuXuat INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SoLuongConLai DECIMAL(18,3) = @SoLuongCanXuat;
    DECLARE @MaLo INT, @SoLuongTrongLo DECIMAL(18,3), @DonGia DECIMAL(18,2);
    DECLARE @TongTonKho DECIMAL(18,3);

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT @TongTonKho = ISNULL(SUM(SoLuongCon), 0)
        FROM Lo
        WHERE MaNguyenLieu = @MaNguyenLieu AND TrangThai = N'ConHang' AND SoLuongCon > 0 AND HanSuDung >= GETDATE();

        IF @TongTonKho < @SoLuongCanXuat
        BEGIN
            DECLARE @Msg NVARCHAR(200) = N'Khong du hang trong kho! Ton kho: ' + CAST(@TongTonKho AS NVARCHAR(50));
            RAISERROR(@Msg, 16, 1);
            RETURN;
        END

        INSERT INTO PhieuXuatKho (NgayXuat, LyDoXuat, MaNguoiTao, TrangThai, GhiChu)
        VALUES (GETDATE(), @LyDoXuat, @MaNguoiTao, N'DaXuat', NULL);

        SET @MaPhieuXuat = SCOPE_IDENTITY();

        DECLARE lo_cursor CURSOR FOR
            SELECT MaLo, SoLuongCon, DonGia
            FROM Lo
            WHERE MaNguyenLieu = @MaNguyenLieu
                AND TrangThai = N'ConHang'
                AND SoLuongCon > 0
                AND HanSuDung >= GETDATE()
            ORDER BY HanSuDung ASC;

        OPEN lo_cursor;
        FETCH NEXT FROM lo_cursor INTO @MaLo, @SoLuongTrongLo, @DonGia;

        WHILE @SoLuongConLai > 0 AND @@FETCH_STATUS = 0
        BEGIN
            DECLARE @SoLuongXuatTuLo DECIMAL(18,3) = CASE
                WHEN @SoLuongTrongLo >= @SoLuongConLai THEN @SoLuongConLai
                ELSE @SoLuongTrongLo
            END;

            INSERT INTO ChiTietPhieuXuatKho (MaPhieuXuat, MaNguyenLieu, MaLo, SoLuong, DonGia)
            VALUES (@MaPhieuXuat, @MaNguyenLieu, @MaLo, @SoLuongXuatTuLo, @DonGia);

            UPDATE Lo
            SET SoLuongCon = SoLuongCon - @SoLuongXuatTuLo,
                TrangThai = CASE WHEN SoLuongCon - @SoLuongXuatTuLo <= 0 THEN N'HetHang' ELSE TrangThai END
            WHERE MaLo = @MaLo;

            SET @SoLuongConLai = @SoLuongConLai - @SoLuongXuatTuLo;

            FETCH NEXT FROM lo_cursor INTO @MaLo, @SoLuongTrongLo, @DonGia;
        END

        CLOSE lo_cursor;
        DEALLOCATE lo_cursor;

        UPDATE NguyenLieu
        SET SoLuongTon = SoLuongTon - @SoLuongCanXuat
        WHERE MaNguyenLieu = @MaNguyenLieu;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('global', 'lo_cursor') >= 0
        BEGIN
            CLOSE lo_cursor;
            DEALLOCATE lo_cursor;
        END
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
