-- Dọn ghi chú "Đã cập nhật HSD mặc định +6 tháng" khỏi cột MoTa
-- Giữ lại nội dung gốc của MoTa (nếu có)

-- Trường hợp 1: MoTa chỉ chứa đúng ghi chú này -> set NULL
UPDATE NguyenLieu
SET MoTa = NULL
WHERE MoTa LIKE '%Đã cập nhật HSD mặc định +6 tháng%'
  AND (MoTa = 'Đã cập nhật HSD mặc định +6 tháng'
       OR MoTa = '(Đã cập nhật HSD mặc định +6 tháng)');

-- Trường hợp 2: MoTa có cả nội dung khác + ghi chú -> xóa phần ghi chú đi
UPDATE NguyenLieu
SET MoTa = LTRIM(RTRIM(
        REPLACE(
        REPLACE(
        REPLACE(MoTa, ' | Đã cập nhật HSD mặc định +6 tháng', ''),
                  'Đã cập nhật HSD mặc định +6 tháng | ', ''),
                  'Đã cập nhật HSD mặc định +6 tháng', '')
    ))
WHERE MoTa LIKE '%Đã cập nhật HSD mặc định +6 tháng%';

-- Kiểm tra kết quả
SELECT MaNguyenLieu, TenNguyenLieu, HanSuDungTu, HanSuDungDen, MoTa
FROM NguyenLieu
WHERE MoTa LIKE '%cập nhật HSD%'
   OR MoTa LIKE '%Đã cập nhật%';