namespace FAB.Server.Models.DTOs;

public class SanPhamCreateRequest
{
    public int MaDanhMuc { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public decimal GiaBan { get; set; }
    public decimal? GiaGoc { get; set; }
    public string? DonVi { get; set; }
    public bool TrangThai { get; set; } = true;
    public List<HinhAnhSanPhamDto> HinhAnhs { get; set; } = [];
    public List<SanPhamToppingInputDto> Toppings { get; set; } = [];
    public List<ComboChiTietInputDto> ComboItems { get; set; } = [];
    public List<ProductBomInputDto> BomItems { get; set; } = [];
}

public class SanPhamToppingInputDto
{
    public int MaTopping { get; set; }
    public decimal GiaThem { get; set; }
}
