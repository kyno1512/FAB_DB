using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class NguoiDung
{
    public int MaNguoiDung { get; set; }

    public int MaVaiTro { get; set; }

    public string HoTen { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? SoDienThoai { get; set; }

    public string MatKhau { get; set; } = null!;

    public string? AnhDaiDien { get; set; }

    public bool TrangThai { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual ICollection<DanhGiaSanPham> DanhGiaSanPhams { get; set; } = new List<DanhGiaSanPham>();

    public virtual ICollection<DonDatHangNhap> DonDatHangNhaps { get; set; } = new List<DonDatHangNhap>();

    public virtual ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();

    public virtual ICollection<GioHang> GioHangs { get; set; } = new List<GioHang>();

    public virtual ICollection<KhachHang> KhachHangs { get; set; } = new List<KhachHang>();

    public virtual ICollection<LichSuChatAi> LichSuChatAis { get; set; } = new List<LichSuChatAi>();

    public virtual ICollection<LichSuTonKho> LichSuTonKhos { get; set; } = new List<LichSuTonKho>();

    public virtual VaiTro MaVaiTroNavigation { get; set; } = null!;

    public virtual ICollection<PhanQuyenNguoiDung> PhanQuyenNguoiDungs { get; set; } = new List<PhanQuyenNguoiDung>();

    public virtual ICollection<PhieuNhapKho> PhieuNhapKhos { get; set; } = new List<PhieuNhapKho>();

    public virtual ICollection<PhieuXuatKho> PhieuXuatKhos { get; set; } = new List<PhieuXuatKho>();
}
