using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class DonHang
{
    public int MaDonHang { get; set; }

    public int? MaKhachHang { get; set; }

    public int? MaNguoiTao { get; set; }

    public int? MaVoucher { get; set; }

    public string LoaiDonHang { get; set; } = null!;

    public string TrangThai { get; set; } = null!;

    public string? GhiChu { get; set; }

    public decimal TongTamTinh { get; set; }

    public decimal SoTienGiam { get; set; }

    public decimal TongThanhToan { get; set; }

    public string? TrackingToken { get; set; }

    public DateTime NgayTao { get; set; }

    // === Trường hủy / hoàn tiền ===
    public bool? YeuCauHuy { get; set; }

    public string? LyDoHuy { get; set; }

    public DateTime? NgayYeuCauHuy { get; set; }

    public string? TrangThaiHuy { get; set; }

    public decimal? SoTienHoan { get; set; }

    public DateTime? NgayHoanTien { get; set; }

    public string? MaGiaoDichHoan { get; set; }

    public string? NguoiXuLyHoan { get; set; }

    public string? Email { get; set; }

    public string? SoDienThoai { get; set; }

    public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();

    public virtual ICollection<GiaoHang> GiaoHangs { get; set; } = new List<GiaoHang>();

    public virtual HoaDon? HoaDon { get; set; }

    public virtual KhachHang? MaKhachHangNavigation { get; set; }

    public virtual NguoiDung? MaNguoiTaoNavigation { get; set; }

    public virtual MaGiamGia? MaVoucherNavigation { get; set; }
}
