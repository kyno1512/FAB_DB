-- ============================================================
-- TẠO BẢNG QUẢN LÝ LÔ NGUYÊN LIỆU
-- Mỗi lần nhập kho sẽ tạo 1 lô mới với NSX và HSD riêng
-- ============================================================

-- Bảng Lô (Batch)
CREATE TABLE Lo (
    MaLo INT IDENTITY(1,1) PRIMARY KEY,
    MaNguyenLieu INT NOT NULL,
    NgaySanXuat DATE NULL,
    HanSuDung DATE NOT NULL,
    SoLuongCon DECIMAL(18,3) NOT NULL DEFAULT 0,
    DonGia DECIMAL(18,2) NULL,  -- Giá nhập của lô này
    NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
    GhiChu NVARCHAR(500) NULL,
    TrangThai NVARCHAR(20) NOT NULL DEFAULT N'ConHang',  -- ConHang, HetHang
    CONSTRAINT FK_Lo_NguyenLieu FOREIGN KEY (MaNguyenLieu) REFERENCES NguyenLieu(MaNguyenLieu) ON DELETE CASCADE
);

-- Index để tìm kiếm nhanh theo nguyên liệu và HSD
CREATE INDEX IX_Lo_MaNguyenLieu ON Lo(MaNguyenLieu);
CREATE INDEX IX_Lo_HanSuDung ON Lo(HanSuDung) WHERE TrangThai = N'ConHang';
CREATE INDEX IX_Lo_NgayTao ON Lo(NgayTao);

-- Cập nhật bảng ChiTietPhieuNhapKho để liên kết với Lô
ALTER TABLE ChiTietPhieuNhapKho
ADD MaLo INT NULL;

ALTER TABLE ChiTietPhieuNhapKho
ADD CONSTRAINT FK_ChiTietPhieuNhapKho_Lo FOREIGN KEY (MaLo) REFERENCES Lo(MaLo) ON DELETE SET NULL;

-- Cập nhật bảng ChiTietPhieuXuatKho để liên kết với Lô
ALTER TABLE ChiTietPhieuXuatKho
ADD MaLo INT NULL;

ALTER TABLE ChiTietPhieuXuatKho
ADD CONSTRAINT FK_ChiTietPhieuXuatKho_Lo FOREIGN KEY (MaLo) REFERENCES Lo(MaLo) ON DELETE SET NULL;

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
    -- Số ngày đến HSD
    DATEDIFF(DAY, GETDATE(), l.HanSuDung) AS SoNgayConLai,
    -- Cảnh báo: sắp hết hạn (7 ngày)
    CASE 
        WHEN l.TrangThai = N'HetHang' THEN N'Đã xuất hết'
        WHEN DATEDIFF(DAY, GETDATE(), l.HanSuDung) <= 0 THEN N'Hết hạn'
        WHEN DATEDIFF(DAY, GETDATE(), l.HanSuDung) <= 7 THEN N'Sắp hết hạn'
        WHEN l.SoLuongCon <= nl.MucTonToiThieu THEN N'Sắp hết hàng'
        ELSE N'Bình thường'
    END AS TinhTrang
FROM Lo l
INNER JOIN NguyenLieu nl ON l.MaNguyenLieu = nl.MaNguyenLieu;

-- ============================================================
-- FUNCTION: Lấy danh sách lô theo FIFO (HSD gần nhất xuất trước)
-- ============================================================
CREATE OR ALTER FUNCTION f_GetLoFIFO(@MaNguyenLieu INT, @SoLuongCanXuat DECIMAL(18,3))
RETURNS TABLE
AS
RETURN
(
    -- Lấy các lô còn hàng, sắp xếp theo HSD tăng dần (lô gần hết hạn xuất trước)
    SELECT TOP(100) 
        MaLo,
        SoLuongCon,
        DonGia
    FROM Lo
    WHERE MaNguyenLieu = @MaNguyenLieu 
        AND TrangThai = N'ConHang' 
        AND SoLuongCon > 0
        AND HanSuDung >= GETDATE()
    ORDER BY HanSuDung ASC  -- FIFO: First In, First Out - lô cũ (HSD gần) xuất trước
);

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
        
        -- Tạo lô mới
        INSERT INTO Lo (MaNguyenLieu, NgaySanXuat, HanSuDung, SoLuongCon, DonGia, NgayTao, GhiChu, TrangThai)
        VALUES (@MaNguyenLieu, @NgaySanXuat, @HanSuDung, @SoLuong, @DonGia, GETDATE(), @GhiChu, N'ConHang');
        
        SET @MaLo = SCOPE_IDENTITY();
        
        -- Cập nhật tồn kho tổng
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

-- ============================================================
-- SP: Xuất kho theo FIFO (tự động trừ từ các lô)
-- ============================================================
CREATE OR ALTER PROCEDURE sp_XuatKhoFIFO
    @MaNguyenLieu INT,
    @SoLuongCanXuat DECIMAL(18,3),
    @GhiChu NVARCHAR(500),
    @MaPhieuXuatKho INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SoLuongConLai DECIMAL(18,3) = @SoLuongCanXuat;
    DECLARE @MaLo INT, @SoLuongTrongLo DECIMAL(18,3), @DonGia DECIMAL(18,2);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra đủ hàng không
        DECLARE @TongTonKho DECIMAL(18,3);
        SELECT @TongTonKho = ISNULL(SUM(SoLuongCon), 0) 
        FROM Lo 
        WHERE MaNguyenLieu = @MaNguyenLieu AND TrangThai = N'ConHang' AND SoLuongCon > 0 AND HanSuDung >= GETDATE();
        
        IF @TongTonKho < @SoLuongCanXuat
        BEGIN
            RAISERROR(N'Không đủ hàng trong kho! Tồn kho: %s', 16, 1, @TongTonKho);
            RETURN;
        END
        
        -- Tạo phiếu xuất kho
        INSERT INTO PhieuXuatKho (NgayXuat, GhiChu, MaNguoiDung)
        VALUES (GETDATE(), @GhiChu, 1);  -- TODO: Thay 1 bằng MaNguoiDung thực tế
        
        SET @MaPhieuXuatKho = SCOPE_IDENTITY();
        
        -- Duyệt qua các lô theo FIFO
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
            
            -- Thêm chi tiết xuất kho
            INSERT INTO ChiTietPhieuXuatKho (MaPhieuXuatKho, MaNguyenLieu, MaLo, SoLuong, DonGia)
            VALUES (@MaPhieuXuatKho, @MaNguyenLieu, @MaLo, @SoLuongXuatTuLo, @DonGia);
            
            -- Trừ số lượng trong lô
            UPDATE Lo 
            SET SoLuongCon = SoLuongCon - @SoLuongXuatTuLo,
                TrangThai = CASE WHEN SoLuongCon - @SoLuongXuatTuLo <= 0 THEN N'HetHang' ELSE TrangThai END
            WHERE MaLo = @MaLo;
            
            SET @SoLuongConLai = @SoLuongConLai - @SoLuongXuatTuLo;
            
            FETCH NEXT FROM lo_cursor INTO @MaLo, @SoLuongTrongLo, @DonGia;
        END
        
        CLOSE lo_cursor;
        DEALLOCATE lo_cursor;
        
        -- Cập nhật tồn kho tổng
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

-- ============================================================
-- TEST: Thêm dữ liệu mẫu
-- ============================================================
-- Giả sử có nguyên liệu MaNguyenLieu = 1
-- Nhập 2 lô cho nguyên liệu này

DECLARE @MaLo1 INT, @MaLo2 INT;

EXEC sp_TaoLoNhaphKho 
    @MaNguyenLieu = 1,
    @NgaySanXuat = '2026-07-01',
    @HanSuDung = '2026-07-31',
    @SoLuong = 100,
    @DonGia = 50000,
    @GhiChu = N'Lô 1 - Nhập đợt 1',
    @MaLo = @MaLo1 OUTPUT;

EXEC sp_TaoLoNhaphKho 
    @MaNguyenLieu = 1,
    @NgaySanXuat = '2026-07-04',
    @HanSuDung = '2026-08-04',
    @SoLuong = 150,
    @DonGia = 52000,
    @GhiChu = N'Lô 2 - Nhập đợt 2',
    @MaLo = @MaLo2 OUTPUT;

-- Xem kết quả
SELECT * FROM v_DanhSachLoNguyenLieu WHERE MaNguyenLieu = 1;
