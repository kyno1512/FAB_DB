-- Add TrangThai to Size table
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('Size') AND name = 'TrangThai'
)
BEGIN
    ALTER TABLE Size ADD TrangThai BIT NOT NULL DEFAULT 1;
    PRINT 'Added TrangThai to Size';
END
ELSE
BEGIN
    PRINT 'TrangThai already exists in Size';
END

-- Verify
SELECT 'Size' AS TableName, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Size';
SELECT 'SanPham' AS TableName, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SanPham';
