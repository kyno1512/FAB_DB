using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class HinhAnhSanPham
{
    public int MaHinhAnh { get; set; }

    public int MaSanPham { get; set; }

    public string DuongDan { get; set; } = null!;

    public bool LaAnhChinh { get; set; }

    public int ThuTu { get; set; }

    public virtual SanPham MaSanPhamNavigation { get; set; } = null!;
}
