using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class PhanQuyenNguoiDung
{
    public int MaPhanQuyen { get; set; }

    public int MaNguoiDung { get; set; }

    public int MaQuyen { get; set; }

    public bool Tat { get; set; }

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;

    public virtual Quyen MaQuyenNavigation { get; set; } = null!;
}
