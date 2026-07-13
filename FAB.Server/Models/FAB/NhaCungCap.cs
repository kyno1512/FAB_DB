using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class NhaCungCap
{
    public int MaNhaCungCap { get; set; }

    public string TenNhaCungCap { get; set; } = null!;

    public string? DiaChi { get; set; }

    public string? SoDienThoai { get; set; }

    public string? Email { get; set; }

    public string? NguoiLienHe { get; set; }

    public string? MaSoThue { get; set; }

    public bool TrangThai { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual ICollection<DonDatHangNhap> DonDatHangNhaps { get; set; } = new List<DonDatHangNhap>();

    public virtual ICollection<NguyenLieuNcc> NguyenLieuNccs { get; set; } = new List<NguyenLieuNcc>();

    public virtual ICollection<PhieuNhapKho> PhieuNhapKhos { get; set; } = new List<PhieuNhapKho>();
}
