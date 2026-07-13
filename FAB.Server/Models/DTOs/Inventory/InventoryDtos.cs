namespace FAB.Server.Models.DTOs.Inventory;

public class InventoryItemListDto
{
    public List<InventoryItemDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
}

public class InventoryItemDto
{
    public int MaNguyenLieu { get; set; }
    public string TenNguyenLieu { get; set; } = string.Empty;
    public string DonVi { get; set; } = string.Empty;
    public decimal SoLuongTon { get; set; }
    public decimal MucTonToiThieu { get; set; }
    public decimal? GiaNhap { get; set; }
    public string? MoTa { get; set; }
    public bool TrangThai { get; set; }
    public string TrangThaiTon { get; set; } = string.Empty;
    public DateOnly? HanSuDungTu { get; set; }
    public DateOnly? HanSuDungDen { get; set; }
    public int? SoNgayConLai { get; set; }
    public string? TrangThaiHSD { get; set; }
    public int TongSoLo { get; set; }
    public int SoLoSapHetHan { get; set; }
    public int SoLoDaHetHan { get; set; }
}

public class CreateInventoryRequest
{
    public string TenNguyenLieu { get; set; } = string.Empty;
    public string DonVi { get; set; } = string.Empty;
    public decimal SoLuongTon { get; set; }
    public decimal MucTonToiThieu { get; set; }
    public decimal? GiaNhap { get; set; }
    public string? MoTa { get; set; }
    public DateOnly? HanSuDungTu { get; set; }
    public DateOnly? HanSuDungDen { get; set; }
}

public class UpdateInventoryRequest : CreateInventoryRequest
{
    public bool TrangThai { get; set; } = true;
}

public class AdjustInventoryRequest
{
    public decimal SoLuongThayDoi { get; set; }
    public string? GhiChu { get; set; }
}

public class InventoryHistoryItemDto
{
    public int MaLichSu { get; set; }
    public int MaNguyenLieu { get; set; }
    public string TenNguyenLieu { get; set; } = string.Empty;
    public string DonVi { get; set; } = string.Empty;
    public string LoaiThayDoi { get; set; } = string.Empty;
    public decimal SoLuongThayDoi { get; set; }
    public decimal SoLuongTruoc { get; set; }
    public decimal SoLuongSau { get; set; }
    public string? GhiChu { get; set; }
    public string? NguoiThucHien { get; set; }
    public DateTime NgayGhiNhan { get; set; }
}

public class ImportReceiptLineDto
{
    public int MaChiTiet { get; set; }
    public int MaNguyenLieu { get; set; }
    public string TenNguyenLieu { get; set; } = string.Empty;
    public string DonVi { get; set; } = string.Empty;
    public decimal SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }
    public DateOnly? HanSuDungTu { get; set; }
    public DateOnly? HanSuDungDen { get; set; }
}

public class InventoryBatchDetailDto
{
    public int MaPhieuNhap { get; set; }
    public DateTime NgayNhap { get; set; }
    public int MaChiTiet { get; set; }
    public string? TenNhaCungCap { get; set; }
    public decimal SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public DateOnly? HanSuDungTu { get; set; }
    public DateOnly? HanSuDungDen { get; set; }
    public int? SoNgayConLai { get; set; }
    public string? TrangThaiHSD { get; set; }
}

public class ImportReceiptListItemDto
{
    public int MaPhieuNhap { get; set; }
    public DateTime NgayNhap { get; set; }
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public string? TenNhaCungCap { get; set; }
    public int SoDong { get; set; }
    public List<ImportReceiptLineDto> ChiTiet { get; set; } = [];
}

public class ExportReceiptLineDto
{
    public int MaChiTiet { get; set; }
    public int MaNguyenLieu { get; set; }
    public string TenNguyenLieu { get; set; } = string.Empty;
    public string DonVi { get; set; } = string.Empty;
    public decimal SoLuong { get; set; }
    public string? GhiChu { get; set; }
}

public class ExportReceiptListItemDto
{
    public int MaPhieuXuat { get; set; }
    public DateTime NgayXuat { get; set; }
    public string LyDoXuat { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public int SoDong { get; set; }
    public List<ExportReceiptLineDto> ChiTiet { get; set; } = [];
}

public class CreateImportReceiptRequest
{
    public int? MaNhaCungCap { get; set; }
    public string? GhiChu { get; set; }
    public List<ImportReceiptLineRequest> Lines { get; set; } = [];
}

public class ImportReceiptLineRequest
{
    public int MaNguyenLieu { get; set; }
    public decimal SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public DateOnly? HanSuDungTu { get; set; }
    public DateOnly? HanSuDungDen { get; set; }
}

public class CreateExportReceiptRequest
{
    public string? LyDoXuat { get; set; }
    public string? GhiChu { get; set; }
    public List<ExportReceiptLineRequest> Lines { get; set; } = [];
}

public class ExportReceiptLineRequest
{
    public int MaNguyenLieu { get; set; }
    public decimal SoLuong { get; set; }
    public string? GhiChu { get; set; }
}

public class DeleteMovementsRequest
{
    public List<int> Ids { get; set; } = [];
}

public class MaterialRecipeDto
{
    public int MaCongThuc { get; set; }
    public int MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public int MaNguyenLieu { get; set; }
    public string TenNguyenLieu { get; set; } = string.Empty;
    public decimal SoLuong { get; set; }
    public string DonVi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public decimal SoLuongTon { get; set; }
}

// Request sửa lô nguyên liệu
public class UpdateLoRequest
{
    public DateOnly? NgaySanXuat { get; set; }
    public DateOnly HanSuDung { get; set; }
    public decimal DonGia { get; set; }
    public string? GhiChu { get; set; }
}

// DTO cho Lô nguyên liệu
public class LoDto
{
    public int MaLo { get; set; }
    public int MaNguyenLieu { get; set; }
    public string TenNguyenLieu { get; set; } = string.Empty;
    public string DonVi { get; set; } = string.Empty;
    public DateOnly? NgaySanXuat { get; set; }
    public DateOnly HanSuDung { get; set; }
    public decimal SoLuong { get; set; } // Số lượng ban đầu nhập
    public decimal SoLuongCon { get; set; }
    public decimal? DonGia { get; set; }
    public DateTime NgayTao { get; set; }
    public string? GhiChu { get; set; }
    public string TrangThai { get; set; } = "ConHang";
    public int SoNgayConLai { get; set; }
    public string TinhTrang { get; set; } = string.Empty;
}

// Request tạo lô mới (khi nhập kho)
public class CreateLoRequest
{
    public int MaNguyenLieu { get; set; }
    public DateOnly? NgaySanXuat { get; set; }
    public DateOnly HanSuDung { get; set; }
    public decimal SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public string? GhiChu { get; set; }
}

// Request nhập kho - dòng có thông tin lô
public class ImportReceiptLineWithBatchRequest
{
    public int MaNguyenLieu { get; set; }
    public decimal SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public DateOnly? NgaySanXuat { get; set; }
    public DateOnly HanSuDung { get; set; }
    public string? GhiChu { get; set; }
}

public class CreateImportReceiptWithBatchRequest
{
    public int? MaNhaCungCap { get; set; }
    public string? GhiChu { get; set; }
    public List<ImportReceiptLineWithBatchRequest> Lines { get; set; } = [];
}
