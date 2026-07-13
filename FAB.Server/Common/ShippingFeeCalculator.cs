using System.Text.RegularExpressions;

namespace FAB.Server.Common;

public static class ShippingFeeCalculator
{
    public const decimal OtherDistrictFee = 15000m;

    public static ServiceResult<decimal> Calculate(string? address)
    {
        if (string.IsNullOrWhiteSpace(address))
            return ServiceResult<decimal>.Fail("Vui lòng nhập địa chỉ giao hàng.");

        if (!IsHoChiMinhCity(address))
            return ServiceResult<decimal>.Fail("Hiện chỉ giao hàng trong TP. Hồ Chí Minh.");

        if (IsDistrict1(address))
            return ServiceResult<decimal>.Ok(0);

        return ServiceResult<decimal>.Ok(OtherDistrictFee);
    }

    public static bool IsHoChiMinhCity(string address)
    {
        var n = Normalize(address);
        return n.Contains("ho chi minh")
            || n.Contains("hcm")
            || n.Contains("tp hcm")
            || n.Contains("tp.hcm")
            || n.Contains("tphcm")
            || n.Contains("sai gon")
            || n.Contains("saigon")
            || n.Contains("thanh pho ho chi minh");
    }

    public static bool IsDistrict1(string address)
    {
        var n = Normalize(address);
        if (Regex.IsMatch(n, @"(?:quận|quan|q\.?)\s*1(?!\d)", RegexOptions.IgnoreCase))
            return true;
        if (Regex.IsMatch(n, @"\bq\s*1\b", RegexOptions.IgnoreCase))
            return true;
        return n.Contains("nguyen hue") && n.Contains("quan 1");
    }

    private static string Normalize(string value)
    {
        var text = value.Trim().ToLowerInvariant();
        text = text
            .Replace("đ", "d")
            .Replace("á", "a").Replace("à", "a").Replace("ả", "a").Replace("ã", "a").Replace("ạ", "a")
            .Replace("ă", "a").Replace("ắ", "a").Replace("ằ", "a").Replace("ẳ", "a").Replace("ẵ", "a").Replace("ặ", "a")
            .Replace("â", "a").Replace("ấ", "a").Replace("ầ", "a").Replace("ẩ", "a").Replace("ẫ", "a").Replace("ậ", "a")
            .Replace("é", "e").Replace("è", "e").Replace("ẻ", "e").Replace("ẽ", "e").Replace("ẹ", "e")
            .Replace("ê", "e").Replace("ế", "e").Replace("ề", "e").Replace("ể", "e").Replace("ễ", "e").Replace("ệ", "e")
            .Replace("í", "i").Replace("ì", "i").Replace("ỉ", "i").Replace("ĩ", "i").Replace("ị", "i")
            .Replace("ó", "o").Replace("ò", "o").Replace("ỏ", "o").Replace("õ", "o").Replace("ọ", "o")
            .Replace("ô", "o").Replace("ố", "o").Replace("ồ", "o").Replace("ổ", "o").Replace("ỗ", "o").Replace("ộ", "o")
            .Replace("ơ", "o").Replace("ớ", "o").Replace("ờ", "o").Replace("ở", "o").Replace("ỡ", "o").Replace("ợ", "o")
            .Replace("ú", "u").Replace("ù", "u").Replace("ủ", "u").Replace("ũ", "u").Replace("ụ", "u")
            .Replace("ư", "u").Replace("ứ", "u").Replace("ừ", "u").Replace("ử", "u").Replace("ữ", "u").Replace("ự", "u")
            .Replace("ý", "y").Replace("ỳ", "y").Replace("ỷ", "y").Replace("ỹ", "y").Replace("ỵ", "y");
        return Regex.Replace(text, @"\s+", " ");
    }
}
