using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class MaGiamGia
{
    public int MaVoucher { get; set; }

    public string TenVoucher { get; set; } = null!;

    public string MaCode { get; set; } = null!;

    public string LoaiGiam { get; set; } = null!;

    public decimal GiaTri { get; set; }

    public decimal? GiamToiDa { get; set; }

    public decimal DieuKienToiThieu { get; set; }

    public int? SoLuongToiDa { get; set; }

    public int DaDung { get; set; }

    public DateTime NgayBatDau { get; set; }

    public DateTime NgayKetThuc { get; set; }

    public bool TrangThai { get; set; }

    public bool GioiHanMotEmail { get; set; }

    public virtual ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();
}
