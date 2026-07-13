using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class DonDatHangNhap
{
    public int MaDonDatHang { get; set; }

    public int MaNhaCungCap { get; set; }

    public int MaNguoiTao { get; set; }

    public DateTime NgayDat { get; set; }

    public DateOnly? NgayGiaoHang { get; set; }

    public string TrangThai { get; set; } = null!;

    public decimal TongTien { get; set; }

    public string? GhiChu { get; set; }

    public virtual ICollection<ChiTietDonDatHangNhap> ChiTietDonDatHangNhaps { get; set; } = new List<ChiTietDonDatHangNhap>();

    public virtual NguoiDung MaNguoiTaoNavigation { get; set; } = null!;

    public virtual NhaCungCap MaNhaCungCapNavigation { get; set; } = null!;
}
