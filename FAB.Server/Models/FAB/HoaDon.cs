using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class HoaDon
{
    public int MaHoaDon { get; set; }

    public int MaDonHang { get; set; }

    public string SoHoaDon { get; set; } = null!;

    public decimal TongTien { get; set; }

    public decimal SoTienGiam { get; set; }

    public decimal TongThanhToan { get; set; }

    public string TrangThai { get; set; } = null!;

    public DateTime NgayTao { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;

    public virtual ICollection<ThanhToan> ThanhToans { get; set; } = new List<ThanhToan>();
}
