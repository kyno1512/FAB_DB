namespace FAB.Server.Models.DTOs.SupplierDebt;

public class SupplierDebtSummaryDto
{
    public decimal TongCongNo { get; set; }
    public decimal DaQuaHan { get; set; }
    public int SoPhieuChuaTra { get; set; }
    public int SoNhaCungCap { get; set; }
}

public class SupplierListItemDto
{
    public int MaNhaCungCap { get; set; }
    public string TenNhaCungCap { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? NguoiLienHe { get; set; }
    public string? DiaChi { get; set; }
    public string? MaSoThue { get; set; }
    public bool TrangThai { get; set; }
    public decimal TongCongNo { get; set; }
    public int SoPhieuNo { get; set; }
    public DateTime NgayTao { get; set; }
}

public class UpsertSupplierRequest
{
    public string TenNhaCungCap { get; set; } = string.Empty;
    public string? DiaChi { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? NguoiLienHe { get; set; }
    public string? MaSoThue { get; set; }
    public bool TrangThai { get; set; } = true;
}

public class SupplierDebtItemDto
{
    public int MaPhieuNhap { get; set; }
    public int? MaNhaCungCap { get; set; }
    public string? TenNhaCungCap { get; set; }
    public DateTime NgayNhap { get; set; }
    public DateOnly? NgayDenHan { get; set; }
    public decimal TongTien { get; set; }
    public decimal SoDaTra { get; set; }
    public decimal ConNo { get; set; }
    public string TrangThaiThanhToan { get; set; } = string.Empty;
    public string TrangThaiPhieu { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public bool QuaHan { get; set; }
}

public class RecordSupplierPaymentRequest
{
    public decimal SoTienTra { get; set; }
    public string? GhiChu { get; set; }
}

public class AssignSupplierToReceiptRequest
{
    public int MaNhaCungCap { get; set; }
    public DateOnly? NgayDenHan { get; set; }
}
