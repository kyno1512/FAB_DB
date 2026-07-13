using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class Topping
{
    public int MaTopping { get; set; }

    public string TenTopping { get; set; } = null!;

    public decimal Gia { get; set; }

    public bool TrangThai { get; set; }

    public virtual ICollection<SanPhamTopping> SanPhamToppings { get; set; } = new List<SanPhamTopping>();
}
