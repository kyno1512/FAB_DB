namespace FAB.Server.Models.DTOs;

public class ReportsOverviewDto
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public string GroupBy { get; set; } = "day";
    public RevenueSummaryDto Revenue { get; set; } = new();
    public OrderSummaryDto Orders { get; set; } = new();
    public int SoKhachHangMoi { get; set; }
    public List<RevenueSeriesPointDto> RevenueSeries { get; set; } = [];
    public List<CategoryRevenueDto> RevenueByCategory { get; set; } = [];
    public List<BestSellerDto> BestSellers { get; set; } = [];
    public InventoryReportDto Inventory { get; set; } = new();
    /// <summary>Chỉ số chưa có hoặc chưa đủ dữ liệu trong DB.</summary>
    public List<string> DataGaps { get; set; } = [];
}

public class RevenueSummaryDto
{
    public decimal TongDoanhThu { get; set; }
    public decimal DoanhThuHoanThanh { get; set; }
    public decimal TongGiamGia { get; set; }
}

public class OrderSummaryDto
{
    public int TongDon { get; set; }
    public int HoanThanh { get; set; }
    public int DaHuy { get; set; }
    public int DangXuLy { get; set; }
    public decimal TyLeHoanThanh { get; set; }
    public decimal TyLeHuy { get; set; }
}

public class RevenueSeriesPointDto
{
    public string Label { get; set; } = string.Empty;
    public DateTime PeriodStart { get; set; }
    public decimal DoanhThu { get; set; }
    public int SoDon { get; set; }
}

public class CategoryRevenueDto
{
    public string TenDanhMuc { get; set; } = string.Empty;
    public decimal DoanhThu { get; set; }
    public int SoLuong { get; set; }
}

public class BestSellerDto
{
    public int MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string TenDanhMuc { get; set; } = string.Empty;
    public int SoLuongBan { get; set; }
    public decimal DoanhThu { get; set; }
    public string? HinhAnhChinh { get; set; }
}

public class InventoryReportDto
{
    public int TongNguyenLieu { get; set; }
    public int SapHet { get; set; }
    public decimal GiaTriTonUocTinh { get; set; }
    public int PhieuNhapTrongKy { get; set; }
    public int PhieuXuatTrongKy { get; set; }
    public decimal TongTienNhapTrongKy { get; set; }
    public List<LowStockReportItemDto> NguyenLieuSapHet { get; set; } = [];
}

public class LowStockReportItemDto
{
    public int MaNguyenLieu { get; set; }
    public string TenNguyenLieu { get; set; } = string.Empty;
    public string DonVi { get; set; } = string.Empty;
    public decimal SoLuongTon { get; set; }
    public decimal MucTonToiThieu { get; set; }
}
