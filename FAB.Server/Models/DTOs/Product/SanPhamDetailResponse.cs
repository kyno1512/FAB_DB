namespace FAB.Server.Models.DTOs;

public class SanPhamDetailResponse
{
    public int MaSanPham { get; set; }
    public int MaDanhMuc { get; set; }
    public string TenDanhMuc { get; set; } = string.Empty;
    public string TenSanPham { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public decimal GiaBan { get; set; }
    public decimal? GiaGoc { get; set; }
    public string? DonVi { get; set; }
    public bool TrangThai { get; set; }
    public bool CoSize { get; set; }
    public DateTime NgayTao { get; set; }
    public List<HinhAnhSanPhamDto> HinhAnhs { get; set; } = [];
    public List<SanPhamToppingDto> Toppings { get; set; } = [];
    public List<ComboChiTietDto> ComboItems { get; set; } = [];
    public List<ProductBomDto> BomItems { get; set; } = [];
    public List<GiaSanPhamTheoSizeResponse> GiaTheoSizes { get; set; } = [];
    public bool ConHang { get; set; }
    public int CoTheBan { get; set; }
}
