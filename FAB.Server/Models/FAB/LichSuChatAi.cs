using System;
using System.Collections.Generic;

namespace FAB.Server.Models;

public partial class LichSuChatAi
{
    public int MaLichSu { get; set; }

    public int? MaNguoiDung { get; set; }

    public string NoiDungNguoiDung { get; set; } = null!;

    public string NoiDungAi { get; set; } = null!;

    public DateTime ThoiGian { get; set; }

    public string? MaPhienChat { get; set; }

    public virtual NguoiDung? MaNguoiDungNavigation { get; set; }
}
