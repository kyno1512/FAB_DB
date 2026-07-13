using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class CongThucSanPham
{
    public int MaCongThuc { get; set; }

    public int MaSanPham { get; set; }

    public int MaNguyenLieu { get; set; }

    public decimal SoLuong { get; set; }

    public string DonVi { get; set; } = null!;

    public string? GhiChu { get; set; }

    public virtual NguyenLieu MaNguyenLieuNavigation { get; set; } = null!;

    public virtual SanPham MaSanPhamNavigation { get; set; } = null!;
}
