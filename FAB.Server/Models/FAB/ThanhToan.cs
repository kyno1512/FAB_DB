using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class ThanhToan
{
    public int MaThanhToan { get; set; }

    public int MaHoaDon { get; set; }

    public string PhuongThucThanhToan { get; set; } = null!;

    public decimal SoTien { get; set; }

    public string? MaGiaoDich { get; set; }

    public string TrangThai { get; set; } = null!;

    public DateTime ThoiGianThanhToan { get; set; }

    public string? GhiChu { get; set; }

    public virtual HoaDon MaHoaDonNavigation { get; set; } = null!;
}
