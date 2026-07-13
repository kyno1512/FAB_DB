using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class LichSuTonKho
{
    public int MaLichSu { get; set; }

    public int MaNguyenLieu { get; set; }

    public string LoaiThayDoi { get; set; } = null!;

    public decimal SoLuongThayDoi { get; set; }

    public decimal SoLuongTruoc { get; set; }

    public decimal SoLuongSau { get; set; }

    public string? GhiChu { get; set; }

    public int? NguoiThucHien { get; set; }

    public DateTime NgayGhiNhan { get; set; }

    public virtual NguyenLieu MaNguyenLieuNavigation { get; set; } = null!;

    public virtual NguoiDung? NguoiThucHienNavigation { get; set; }
}
