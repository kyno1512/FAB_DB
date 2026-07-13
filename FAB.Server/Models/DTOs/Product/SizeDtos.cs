namespace FAB.Server.Models.DTOs;

public class SizeResponse
{
    public int MaSize { get; set; }
    public string TenSize { get; set; } = string.Empty;
    public decimal HeSoGia { get; set; }
    public int ThuTu { get; set; }
}

public class GiaSanPhamTheoSizeResponse
{
    public int MaGia { get; set; }
    public int MaSanPham { get; set; }
    public int MaSize { get; set; }
    public string TenSize { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public decimal HeSoGia { get; set; }
}

public class SanPhamGiaTheoSizeDto
{
    public int MaSanPham { get; set; }
    public bool CoSize { get; set; }
    public List<GiaSanPhamTheoSizeResponse> GiaTheoSizes { get; set; } = new();
}
