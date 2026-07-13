using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class Size
{
    public int MaSize { get; set; }

    public string TenSize { get; set; } = null!;

    public decimal HeSoGia { get; set; }

    public int ThuTu { get; set; }

    public bool TrangThai { get; set; }

    public virtual ICollection<GiaSanPhamTheoSize> GiaSanPhamTheoSizes { get; set; } = new List<GiaSanPhamTheoSize>();
}
