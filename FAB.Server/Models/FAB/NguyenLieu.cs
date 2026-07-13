using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class NguyenLieu
{
    public int MaNguyenLieu { get; set; }

    public string TenNguyenLieu { get; set; } = null!;

    public string DonVi { get; set; } = null!;

    public decimal SoLuongTon { get; set; }

    public decimal MucTonToiThieu { get; set; }

    public decimal? GiaNhap { get; set; }

    public string? MoTa { get; set; }

    public bool TrangThai { get; set; }

    public DateOnly? HanSuDungTu { get; set; }

    public DateOnly? HanSuDungDen { get; set; }

    public virtual ICollection<AiduBaoTonKho> AiduBaoTonKhos { get; set; } = new List<AiduBaoTonKho>();

    public virtual ICollection<ChiTietDonDatHangNhap> ChiTietDonDatHangNhaps { get; set; } = new List<ChiTietDonDatHangNhap>();

    public virtual ICollection<ChiTietPhieuNhapKho> ChiTietPhieuNhapKhos { get; set; } = new List<ChiTietPhieuNhapKho>();

    public virtual ICollection<ChiTietPhieuXuatKho> ChiTietPhieuXuatKhos { get; set; } = new List<ChiTietPhieuXuatKho>();

    public virtual ICollection<CongThucSanPham> CongThucSanPhams { get; set; } = new List<CongThucSanPham>();

    public virtual ICollection<LichSuTonKho> LichSuTonKhos { get; set; } = new List<LichSuTonKho>();

    public virtual ICollection<Lo> Los { get; set; } = new List<Lo>();

    public virtual ICollection<NguyenLieuNcc> NguyenLieuNccs { get; set; } = new List<NguyenLieuNcc>();
}
