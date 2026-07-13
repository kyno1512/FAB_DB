-- Backfill HanSuDung cho NguyenLieu chưa có
-- Ngày chạy: 2026-07-01
-- Mục tiêu: tất cả nguyên liệu đều có HSD > 30 ngày tính từ hôm nay

DECLARE @today DATE = CAST(GETDATE() AS DATE);
DECLARE @tu   DATE = @today;                           -- HSD TỪ: hôm nay
DECLARE @den  DATE = DATEADD(MONTH, 6, @today);        -- HSD ĐẾN: +6 tháng

-- 1. Cập nhật nhóm 1: cả TỪ và ĐẾN đều NULL -> gán cả 2
UPDATE nl
SET
    HanSuDungTu  = @tu,
    HanSuDungDen = @den,
    MoTa         = CASE
                       WHEN MoTa IS NULL OR MoTa = ''
                            THEN '(Đã cập nhật HSD mặc định +6 tháng)'
                       ELSE MoTa + ' | Đã cập nhật HSD mặc định +6 tháng'
                   END
FROM NguyenLieu nl
WHERE nl.HanSuDungTu IS NULL
  AND nl.HanSuDungDen IS NULL;

-- 2. Cập nhật nhóm 2: có TỪ nhưng ĐẾN NULL -> gán ĐẾN
UPDATE nl
SET
    HanSuDungDen = @den,
    MoTa         = CASE
                       WHEN MoTa IS NULL OR MoTa = ''
                            THEN '(Đã cập nhật HSD mặc định +6 tháng)'
                       ELSE MoTa + ' | Đã cập nhật HSD mặc định +6 tháng'
                   END
FROM NguyenLieu nl
WHERE nl.HanSuDungTu IS NOT NULL
  AND nl.HanSuDungDen IS NULL;

-- 3. Kiểm tra kết quả: đảm bảo tất cả đều có HSD > 30 ngày
SELECT
    MaNguyenLieu,
    TenNguyenLieu,
    HanSuDungTu,
    HanSuDungDen,
    DATEDIFF(DAY, @today, HanSuDungDen) AS SoNgayConLai
FROM NguyenLieu
WHERE HanSuDungDen IS NULL
   OR DATEDIFF(DAY, @today, HanSuDungDen) <= 30
ORDER BY SoNgayConLai;
