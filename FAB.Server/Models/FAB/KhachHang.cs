using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class KhachHang
{
    public int MaKhachHang { get; set; }

    public int? MaNguoiDung { get; set; }

    public string HoTen { get; set; } = null!;

    public string SoDienThoai { get; set; } = null!;

    public string? Email { get; set; }

    public string? DiaChi { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public int DiemTichLuy { get; set; }

    public DateTime NgayTao { get; set; }

    public virtual ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();

    public virtual NguoiDung? MaNguoiDungNavigation { get; set; }
}
