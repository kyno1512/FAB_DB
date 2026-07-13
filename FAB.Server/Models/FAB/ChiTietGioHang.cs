using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class ChiTietGioHang
{
    public int MaChiTiet { get; set; }

    public int MaGioHang { get; set; }

    public int MaSanPham { get; set; }

    public int? MaSize { get; set; }

    public int SoLuong { get; set; }

    public virtual GioHang MaGioHangNavigation { get; set; } = null!;

    public virtual SanPham MaSanPhamNavigation { get; set; } = null!;

    public virtual Size? MaSizeNavigation { get; set; }
}
