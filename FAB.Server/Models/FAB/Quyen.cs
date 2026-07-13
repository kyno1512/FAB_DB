using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class Quyen
{
    public int MaQuyen { get; set; }

    public string TenQuyen { get; set; } = null!;

    public string? MoTa { get; set; }

    public string? Module { get; set; }

    public virtual ICollection<VaiTro> MaVaiTros { get; set; } = new List<VaiTro>();

    public virtual ICollection<PhanQuyenNguoiDung> PhanQuyenNguoiDungs { get; set; } = new List<PhanQuyenNguoiDung>();
}
