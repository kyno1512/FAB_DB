using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class DanhMuc
{
    public int MaDanhMuc { get; set; }

    public string TenDanhMuc { get; set; } = null!;

    public string? MoTa { get; set; }

    public string? HinhAnh { get; set; }

    public int ThuTu { get; set; }

    public bool TrangThai { get; set; }

    public bool CoSize { get; set; } = true;

    public virtual ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
