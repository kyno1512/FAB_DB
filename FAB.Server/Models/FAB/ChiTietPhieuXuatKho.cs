using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class ChiTietPhieuXuatKho
{
    public int MaChiTiet { get; set; }

    public int MaPhieuXuat { get; set; }

    public int MaNguyenLieu { get; set; }

    public int? MaLo { get; set; }

    public decimal SoLuong { get; set; }

    public decimal? DonGia { get; set; }

    public string? GhiChu { get; set; }

    public virtual Lo? MaLoNavigation { get; set; }

    public virtual NguyenLieu MaNguyenLieuNavigation { get; set; } = null!;

    public virtual PhieuXuatKho MaPhieuXuatNavigation { get; set; } = null!;
}
