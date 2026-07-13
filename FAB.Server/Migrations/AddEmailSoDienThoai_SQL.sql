-- Thêm cột Email và SoDienThoai vào bảng DonHang
ALTER TABLE DonHang ADD Email NVARCHAR(255) NULL;
ALTER TABLE DonHang ADD SoDienThoai NVARCHAR(20) NULL;
