-- Thêm cột TrangThai vào bảng SanPham nếu chưa có
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SanPham') AND name = 'TrangThai')
BEGIN
    ALTER TABLE SanPham ADD TrangThai BIT NOT NULL DEFAULT 1;
    PRINT 'Added TrangThai column to SanPham';
END
ELSE
BEGIN
    PRINT 'TrangThai column already exists in SanPham';
END
