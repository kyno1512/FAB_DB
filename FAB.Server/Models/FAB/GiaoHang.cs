using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class GiaoHang
{
    public int MaGiaoHang { get; set; }

    public int MaDonHang { get; set; }

    public string DiaChiGiao { get; set; } = null!;

    public string NguoiNhan { get; set; } = null!;

    public string SdtnguoiNhan { get; set; } = null!;

    public string TrangThai { get; set; } = null!;

    public decimal PhiGiaoHang { get; set; }

    public string? GhiChu { get; set; }

    public DateTime? NgayGiao { get; set; }

    public DateTime NgayTao { get; set; }

    public int? MaShipper { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;

    public virtual NguoiDung? MaShipperNavigation { get; set; }
}
