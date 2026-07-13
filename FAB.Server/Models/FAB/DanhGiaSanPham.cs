using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class DanhGiaSanPham
{
    public int MaDanhGia { get; set; }

    public int MaSanPham { get; set; }

    public int? MaNguoiDung { get; set; }

    public string? HoTenKhach { get; set; }

    public byte Diem { get; set; }

    public string NoiDung { get; set; } = null!;

    public bool TrangThai { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual NguoiDung? MaNguoiDungNavigation { get; set; }

    public virtual SanPham MaSanPhamNavigation { get; set; } = null!;
}
