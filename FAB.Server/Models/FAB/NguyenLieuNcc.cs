using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class NguyenLieuNcc
{
    public int MaNguyenLieu { get; set; }

    public int MaNhaCungCap { get; set; }

    public decimal GiaCungCap { get; set; }

    public int? ThoiGianGiao { get; set; }

    public bool IsUuTien { get; set; }

    public virtual NguyenLieu MaNguyenLieuNavigation { get; set; } = null!;

    public virtual NhaCungCap MaNhaCungCapNavigation { get; set; } = null!;
}
