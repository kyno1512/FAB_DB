using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class SanPhamTopping
{
    public int MaSanPham { get; set; }

    public int MaTopping { get; set; }

    public decimal GiaThem { get; set; }

    public virtual SanPham MaSanPhamNavigation { get; set; } = null!;

    public virtual Topping MaToppingNavigation { get; set; } = null!;
}
