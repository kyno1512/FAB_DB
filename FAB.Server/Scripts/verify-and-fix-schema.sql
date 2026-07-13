-- Verify and fix TrangThai column in SanPham table
-- Run in SSMS on FAB_DB

-- 1. Check if column exists
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'SanPham' AND COLUMN_NAME = 'TrangThai';

-- 2. If column doesn't exist, add it
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'SanPham' AND COLUMN_NAME = 'TrangThai'
)
BEGIN
    ALTER TABLE SanPham ADD TrangThai BIT NOT NULL DEFAULT 1;
    PRINT 'Added TrangThai column to SanPham';
END
ELSE
BEGIN
    PRINT 'TrangThai column already exists';
END

-- 3. Verify CoSize for Combo and Bánh
SELECT MaDanhMuc, TenDanhMuc, CoSize FROM DanhMuc WHERE TenDanhMuc IN (N'Combo', N'Bánh');

-- 4. If CoSize still 1, update it
UPDATE DanhMuc SET CoSize = 0 WHERE TenDanhMuc IN (N'Combo', N'Bánh');
