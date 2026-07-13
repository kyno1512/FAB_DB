using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class ChiTietPhieuNhapKho
{
    public int MaChiTiet { get; set; }

    public int MaPhieuNhap { get; set; }

    public int MaNguyenLieu { get; set; }

    public int? MaLo { get; set; }

    public decimal SoLuong { get; set; }

    public decimal DonGia { get; set; }

    public decimal? ThanhTien { get; set; }

    public virtual Lo? MaLoNavigation { get; set; }

    public virtual NguyenLieu MaNguyenLieuNavigation { get; set; } = null!;

    public virtual PhieuNhapKho MaPhieuNhapNavigation { get; set; } = null!;
}
