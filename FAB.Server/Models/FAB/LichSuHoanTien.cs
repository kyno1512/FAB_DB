using System;

namespace FAB.Server.Models;

public class LichSuHoanTien
{
    public int MaLichSu { get; set; }
    public int MaDonHang { get; set; }
    public int MaNguoiXuLy { get; set; }
    public string? HoTenNguoiXuLy { get; set; }
    public decimal SoTienHoan { get; set; }
    public string? MaGiaoDichHoan { get; set; }
    public string? GhiChu { get; set; }
    public DateTime NgayXuLy { get; set; }

    public virtual DonHang MaDonHangNavigation { get; set; } = null!;
    public virtual NguoiDung MaNguoiXuLyNavigation { get; set; } = null!;
}
