using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class SanPham
{
    public int MaSanPham { get; set; }

    public int MaDanhMuc { get; set; }

    public string TenSanPham { get; set; } = null!;

    public string? MoTa { get; set; }

    public decimal GiaBan { get; set; }

    public decimal? GiaGoc { get; set; }

    public string? DonVi { get; set; }

    public bool TrangThai { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();

    public virtual ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; } = new List<ChiTietGioHang>();

    public virtual ICollection<ComboChiTiet> ComboChiTiets { get; set; } = new List<ComboChiTiet>();

    public virtual ICollection<ComboChiTiet> ComboThanhPhanCua { get; set; } = new List<ComboChiTiet>();

    public virtual ICollection<CongThucSanPham> CongThucSanPhams { get; set; } = new List<CongThucSanPham>();

    public virtual ICollection<DanhGiaSanPham> DanhGiaSanPhams { get; set; } = new List<DanhGiaSanPham>();

    public virtual ICollection<HinhAnhSanPham> HinhAnhSanPhams { get; set; } = new List<HinhAnhSanPham>();

    public virtual DanhMuc MaDanhMucNavigation { get; set; } = null!;

    public virtual ICollection<SanPhamTopping> SanPhamToppings { get; set; } = new List<SanPhamTopping>();

    public virtual ICollection<GiaSanPhamTheoSize> GiaSanPhamTheoSizes { get; set; } = new List<GiaSanPhamTheoSize>();
}
