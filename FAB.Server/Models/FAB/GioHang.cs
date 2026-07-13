using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class GioHang
{
    public int MaGioHang { get; set; }

    public int MaNguoiDung { get; set; }

    public DateTime NgayTao { get; set; }

    public DateTime NgayCapNhat { get; set; }

    public virtual ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; } = new List<ChiTietGioHang>();

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;
}
