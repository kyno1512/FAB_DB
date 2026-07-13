using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class Lo
{
    public int MaLo { get; set; }

    public int MaNguyenLieu { get; set; }

    public DateOnly? NgaySanXuat { get; set; }

    public DateOnly HanSuDung { get; set; }

    public decimal SoLuong { get; set; } // Số lượng ban đầu nhập

    public decimal SoLuongCon { get; set; } // Số lượng còn lại

    public decimal? DonGia { get; set; }

    public DateTime NgayTao { get; set; }

    public string? GhiChu { get; set; }

    public string TrangThai { get; set; } = "ConHang";

    public virtual NguyenLieu MaNguyenLieuNavigation { get; set; } = null!;

    public virtual ICollection<ChiTietPhieuNhapKho> ChiTietPhieuNhapKhos { get; set; } = new List<ChiTietPhieuNhapKho>();

    public virtual ICollection<ChiTietPhieuXuatKho> ChiTietPhieuXuatKhos { get; set; } = new List<ChiTietPhieuXuatKho>();
}
