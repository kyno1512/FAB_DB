-- Migration: Add SoLuong column to Los table
-- Mục đích: Lưu số lượng ban đầu nhập (khác với SoLuongCon là số còn lại)

ALTER TABLE Los ADD SoLuong DECIMAL(18,2) NOT NULL DEFAULT 0;

-- Cập nhật dữ liệu hiện có: SoLuong = SoLuongCon (cho các lô đã nhập trước đó)
UPDATE Los SET SoLuong = SoLuongCon WHERE SoLuong = 0 OR SoLuong IS NULL;
