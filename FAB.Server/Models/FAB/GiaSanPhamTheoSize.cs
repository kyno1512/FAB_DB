using System.ComponentModel.DataAnnotations.Schema;

namespace FAB.Server.Models;

public partial class GiaSanPhamTheoSize
{
    public int MaGia { get; set; }

    public int MaSanPham { get; set; }

    public int MaSize { get; set; }

    public decimal Gia { get; set; }

    [ForeignKey(nameof(MaSanPham))]
    public virtual SanPham MaSanPhamNavigation { get; set; } = null!;

    [ForeignKey(nameof(MaSize))]
    public virtual Size MaSizeNavigation { get; set; } = null!;
}
