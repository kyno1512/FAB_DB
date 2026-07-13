using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Admin;

public class ReportsAdminService : IReportsAdminService
{
    private readonly FabDbContext _context;

    public ReportsAdminService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<ReportsOverviewDto>> GetOverviewAsync(
        DateTime? from,
        DateTime? to,
        string? groupBy,
        CancellationToken ct = default)
    {
        var toDate = (to ?? DateTime.Now).Date.AddDays(1).AddTicks(-1);
        var fromDate = (from ?? toDate.AddDays(-29).Date).Date;
        if (fromDate > toDate)
            return ServiceResult<ReportsOverviewDto>.Fail("Ngày bắt đầu phải trước ngày kết thúc.");

        var normalizedGroup = NormalizeGroupBy(groupBy);

        var orders = await _context.DonHangs
            .AsNoTracking()
            .Where(d => d.NgayTao >= fromDate && d.NgayTao <= toDate)
            .Select(d => new OrderRow(
                d.MaDonHang,
                d.TrangThai,
                d.TongThanhToan,
                d.SoTienGiam,
                d.NgayTao))
            .ToListAsync(ct);

        var validOrderIds = orders
            .Where(o => o.TrangThai != "DaHuy")
            .Select(o => o.MaDonHang)
            .ToHashSet();

        var revenue = new RevenueSummaryDto
        {
            TongDoanhThu = orders.Where(o => o.TrangThai != "DaHuy").Sum(o => o.TongThanhToan),
            DoanhThuHoanThanh = orders.Where(o => o.TrangThai == "HoanThanh").Sum(o => o.TongThanhToan),
            TongGiamGia = orders.Where(o => o.TrangThai != "DaHuy").Sum(o => o.SoTienGiam),
        };

        var total = orders.Count;
        var completed = orders.Count(o => o.TrangThai == "HoanThanh");
        var cancelled = orders.Count(o => o.TrangThai == "DaHuy");
        var inProgress = total - completed - cancelled;

        var orderSummary = new OrderSummaryDto
        {
            TongDon = total,
            HoanThanh = completed,
            DaHuy = cancelled,
            DangXuLy = inProgress,
            TyLeHoanThanh = total > 0 ? Math.Round(completed * 100m / total, 1) : 0,
            TyLeHuy = total > 0 ? Math.Round(cancelled * 100m / total, 1) : 0,
        };

        var revenueSeries = BuildRevenueSeries(
            orders.Where(o => o.TrangThai != "DaHuy").ToList(),
            fromDate,
            toDate,
            normalizedGroup);

        var lineItems = await _context.ChiTietDonHangs
            .AsNoTracking()
            .Where(c => validOrderIds.Contains(c.MaDonHang))
            .Select(c => new
            {
                c.MaSanPham,
                c.SoLuong,
                c.ThanhTien,
                TenSanPham = c.MaSanPhamNavigation.TenSanPham,
                TenDanhMuc = c.MaSanPhamNavigation.MaDanhMucNavigation.TenDanhMuc,
            })
            .ToListAsync(ct);

        var bestSellers = lineItems
            .GroupBy(x => new { x.MaSanPham, x.TenSanPham, x.TenDanhMuc })
            .Select(g => new BestSellerDto
            {
                MaSanPham = g.Key.MaSanPham,
                TenSanPham = g.Key.TenSanPham,
                TenDanhMuc = g.Key.TenDanhMuc,
                SoLuongBan = g.Sum(x => x.SoLuong),
                DoanhThu = g.Sum(x => x.ThanhTien ?? 0),
            })
            .OrderByDescending(x => x.SoLuongBan)
            .Take(10)
            .ToList();

        if (bestSellers.Count > 0)
        {
            var productIds = bestSellers.Select(x => x.MaSanPham).ToList();
            var images = await _context.HinhAnhSanPhams
                .AsNoTracking()
                .Where(h => productIds.Contains(h.MaSanPham))
                .Select(h => new { h.MaSanPham, h.DuongDan, h.LaAnhChinh, h.ThuTu })
                .ToListAsync(ct);

            foreach (var item in bestSellers)
            {
                item.HinhAnhChinh = images
                    .Where(h => h.MaSanPham == item.MaSanPham)
                    .OrderByDescending(h => h.LaAnhChinh)
                    .ThenBy(h => h.ThuTu)
                    .Select(h => h.DuongDan)
                    .FirstOrDefault();
            }
        }

        var newCustomers = await _context.KhachHangs
            .AsNoTracking()
            .CountAsync(k => k.NgayTao >= fromDate && k.NgayTao <= toDate, ct);

        var revenueByCategory = lineItems
            .GroupBy(x => x.TenDanhMuc)
            .Select(g => new CategoryRevenueDto
            {
                TenDanhMuc = g.Key,
                DoanhThu = g.Sum(x => x.ThanhTien ?? 0),
                SoLuong = g.Sum(x => x.SoLuong),
            })
            .OrderByDescending(x => x.DoanhThu)
            .ToList();

        var materials = await _context.NguyenLieus
            .AsNoTracking()
            .Where(x => x.TrangThai)
            .Select(x => new
            {
                x.MaNguyenLieu,
                x.TenNguyenLieu,
                x.DonVi,
                x.SoLuongTon,
                x.MucTonToiThieu,
                x.GiaNhap,
            })
            .ToListAsync(ct);

        var lowStock = materials
            .Where(x => x.SoLuongTon <= x.MucTonToiThieu)
            .Select(x => new LowStockReportItemDto
            {
                MaNguyenLieu = x.MaNguyenLieu,
                TenNguyenLieu = x.TenNguyenLieu,
                DonVi = x.DonVi,
                SoLuongTon = x.SoLuongTon,
                MucTonToiThieu = x.MucTonToiThieu,
            })
            .OrderBy(x => x.SoLuongTon)
            .ToList();

        var importReceipts = await _context.PhieuNhapKhos
            .AsNoTracking()
            .Where(x => x.NgayNhap >= fromDate && x.NgayNhap <= toDate)
            .Select(x => new { x.TongTien })
            .ToListAsync(ct);

        var exportReceiptCount = await _context.PhieuXuatKhos
            .AsNoTracking()
            .Where(x => x.NgayXuat >= fromDate && x.NgayXuat <= toDate)
            .CountAsync(ct);

        var inventory = new InventoryReportDto
        {
            TongNguyenLieu = materials.Count,
            SapHet = lowStock.Count,
            GiaTriTonUocTinh = materials.Sum(x => x.SoLuongTon * (x.GiaNhap ?? 0)),
            PhieuNhapTrongKy = importReceipts.Count,
            PhieuXuatTrongKy = exportReceiptCount,
            TongTienNhapTrongKy = importReceipts.Sum(x => x.TongTien),
            NguyenLieuSapHet = lowStock,
        };

        return ServiceResult<ReportsOverviewDto>.Ok(new ReportsOverviewDto
        {
            From = fromDate,
            To = toDate,
            GroupBy = normalizedGroup,
            Revenue = revenue,
            Orders = orderSummary,
            SoKhachHangMoi = newCustomers,
            RevenueSeries = revenueSeries,
            RevenueByCategory = revenueByCategory,
            BestSellers = bestSellers,
            Inventory = inventory,
            DataGaps = BuildDataGaps(total, lineItems.Count, materials.Count),
        });
    }

    private static List<string> BuildDataGaps(int orderCount, int lineItemCount, int materialCount)
    {
        var gaps = new List<string>
        {
            "Lợi nhuận / giá vốn theo món: DB chưa lưu giá vốn thành phẩm (chỉ có giá nhập nguyên liệu).",
            "Chi phí vận hành, lương, thuế: chưa có bảng chi phí trong DB.",
            "Gợi ý AI trên Tổng quan: dữ liệu demo, không lấy từ DB.",
            "Xuất phiếu xuất kho do đơn hàng: ghi LichSuTonKho, không tạo PhieuXuatKho — số phiếu xuất chỉ tính phiếu thủ công.",
        };

        if (orderCount == 0)
            gaps.Add("Chưa có đơn hàng trong kỳ — doanh thu và món bán chạy sẽ trống.");

        if (lineItemCount == 0 && orderCount > 0)
            gaps.Add("Chi tiết đơn hàng trống — không tính được doanh thu theo danh mục / món bán chạy.");

        if (materialCount == 0)
            gaps.Add("Chưa có nguyên liệu trong kho — báo cáo tồn kho trống.");

        return gaps;
    }

    private static string NormalizeGroupBy(string? groupBy)
        => groupBy?.ToLowerInvariant() switch
        {
            "week" => "week",
            "month" => "month",
            _ => "day",
        };

    private static List<RevenueSeriesPointDto> BuildRevenueSeries(
        IReadOnlyList<OrderRow> orders,
        DateTime from,
        DateTime to,
        string groupBy)
    {
        var buckets = new Dictionary<DateTime, (decimal Revenue, int Count)>();

        foreach (var order in orders)
        {
            var key = GetPeriodStart(order.NgayTao, groupBy);
            if (!buckets.TryGetValue(key, out var bucket))
                bucket = (0, 0);
            buckets[key] = (bucket.Revenue + order.TongThanhToan, bucket.Count + 1);
        }

        var points = new List<RevenueSeriesPointDto>();
        var cursor = GetPeriodStart(from, groupBy);
        var end = GetPeriodStart(to, groupBy);

        while (cursor <= end)
        {
            buckets.TryGetValue(cursor, out var bucket);
            points.Add(new RevenueSeriesPointDto
            {
                Label = FormatPeriodLabel(cursor, groupBy),
                PeriodStart = cursor,
                DoanhThu = bucket.Revenue,
                SoDon = bucket.Count,
            });
            cursor = AdvancePeriod(cursor, groupBy);
        }

        return points;
    }

    private static DateTime GetPeriodStart(DateTime date, string groupBy)
    {
        var d = date.Date;
        return groupBy switch
        {
            "week" => d.AddDays(-(((int)d.DayOfWeek + 6) % 7)),
            "month" => new DateTime(d.Year, d.Month, 1),
            _ => d,
        };
    }

    private static DateTime AdvancePeriod(DateTime cursor, string groupBy)
        => groupBy switch
        {
            "week" => cursor.AddDays(7),
            "month" => cursor.AddMonths(1),
            _ => cursor.AddDays(1),
        };

    private static string FormatPeriodLabel(DateTime periodStart, string groupBy)
        => groupBy switch
        {
            "week" => $"Tuần {periodStart:dd/MM}",
            "month" => periodStart.ToString("MM/yyyy"),
            _ => periodStart.ToString("dd/MM"),
        };

    private sealed record OrderRow(
        int MaDonHang,
        string TrangThai,
        decimal TongThanhToan,
        decimal SoTienGiam,
        DateTime NgayTao);
}
