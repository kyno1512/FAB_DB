namespace FAB.Server.Models.DTOs.Voucher;

public class CreateVoucherRequest
{
    public string TenVoucher { get; set; } = string.Empty;
    public string MaCode { get; set; } = string.Empty;
    public string LoaiGiam { get; set; } = "PhanTram";
    public decimal GiaTri { get; set; }
    public decimal? GiamToiDa { get; set; }
    public decimal DieuKienToiThieu { get; set; }
    public int? SoLuongToiDa { get; set; }
    public bool GioiHanMotEmail { get; set; }

    // Nhận timestamp (milliseconds) để tránh lỗi timezone
    private long _ngayBatDauTicks;
    public long NgayBatDau
    {
        get => _ngayBatDauTicks;
        set => NgayBatDauParsed = DateTimeOffset.FromUnixTimeMilliseconds(value).UtcDateTime;
    }
    [System.Text.Json.Serialization.JsonIgnore]
    public DateTime NgayBatDauParsed { get; private set; }

    private long _ngayKetThucTicks;
    public long NgayKetThuc
    {
        get => _ngayKetThucTicks;
        set => NgayKetThucParsed = DateTimeOffset.FromUnixTimeMilliseconds(value).UtcDateTime;
    }
    [System.Text.Json.Serialization.JsonIgnore]
    public DateTime NgayKetThucParsed { get; private set; }

    public bool TrangThai { get; set; } = true;
}
