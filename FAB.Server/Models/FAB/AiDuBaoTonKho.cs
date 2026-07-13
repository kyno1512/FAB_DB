using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class AiduBaoTonKho
{
    public int MaDuBao { get; set; }

    public int MaNguyenLieu { get; set; }

    public DateOnly NgayDuBao { get; set; }

    public decimal SoLuongDuBao { get; set; }

    public decimal? SoLuongThucTe { get; set; }

    public decimal? DoChinhXac { get; set; }

    public string? MoHinhSuDung { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual NguyenLieu MaNguyenLieuNavigation { get; set; } = null!;
}
