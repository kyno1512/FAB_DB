using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class PhieuNhapKho
{
    public int MaPhieuNhap { get; set; }

    public int MaNguoiTao { get; set; }

    public int? MaNhaCungCap { get; set; }

    public DateTime NgayNhap { get; set; }

    public decimal TongTien { get; set; }

    public string TrangThai { get; set; } = null!;

    public decimal SoDaTra { get; set; }

    public DateOnly? NgayDenHan { get; set; }

    public string TrangThaiThanhToan { get; set; } = "ChuaTra";

    public string? GhiChu { get; set; }

    public virtual ICollection<ChiTietPhieuNhapKho> ChiTietPhieuNhapKhos { get; set; } = new List<ChiTietPhieuNhapKho>();

    public virtual NguoiDung MaNguoiTaoNavigation { get; set; } = null!;

    public virtual NhaCungCap? MaNhaCungCapNavigation { get; set; }
}
