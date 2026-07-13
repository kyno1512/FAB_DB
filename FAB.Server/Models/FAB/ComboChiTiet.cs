namespace FAB.Server.Models;

public partial class ComboChiTiet
{
    public int MaCombo { get; set; }

    public int MaSanPhamCon { get; set; }

    public int SoLuong { get; set; } = 1;

    public int ThuTu { get; set; }

    public virtual SanPham MaComboNavigation { get; set; } = null!;

    public virtual SanPham MaSanPhamConNavigation { get; set; } = null!;
}
