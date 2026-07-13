using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class ChiTietDonDatHangNhap
{
    public int MaChiTiet { get; set; }

    public int MaDonDatHang { get; set; }

    public int MaNguyenLieu { get; set; }

    public decimal SoLuong { get; set; }

    public decimal DonGia { get; set; }

    public decimal? ThanhTien { get; set; }

    public virtual DonDatHangNhap MaDonDatHangNavigation { get; set; } = null!;

    public virtual NguyenLieu MaNguyenLieuNavigation { get; set; } = null!;
}
