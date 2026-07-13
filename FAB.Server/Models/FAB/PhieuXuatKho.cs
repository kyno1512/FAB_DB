using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class PhieuXuatKho
{
    public int MaPhieuXuat { get; set; }

    public int MaNguoiTao { get; set; }

    public string LyDoXuat { get; set; } = null!;

    public DateTime NgayXuat { get; set; }

    public string TrangThai { get; set; } = null!;

    public string? GhiChu { get; set; }

    public virtual ICollection<ChiTietPhieuXuatKho> ChiTietPhieuXuatKhos { get; set; } = new List<ChiTietPhieuXuatKho>();

    public virtual NguoiDung MaNguoiTaoNavigation { get; set; } = null!;
}
