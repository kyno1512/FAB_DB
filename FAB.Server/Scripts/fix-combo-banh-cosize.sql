-- Script để set CoSize = false cho danh mục Combo và Bánh
-- Chạy trong SSMS trên database FAB_DB

-- Xem các danh mục hiện tại
SELECT MaDanhMuc, TenDanhMuc, CoSize FROM DanhMuc ORDER BY TenDanhMuc;

-- Set CoSize = 0 cho Combo
UPDATE DanhMuc SET CoSize = 0 WHERE TenDanhMuc = 'Combo';

-- Set CoSize = 0 cho Bánh (nếu tên khác thì sửa lại)
UPDATE DanhMuc SET CoSize = 0 WHERE TenDanhMuc = 'Bánh';
