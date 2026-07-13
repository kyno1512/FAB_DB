using System.Collections.Specialized;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace FAB.Server.Services.Payment;

/// <summary>
/// Helper ký/verify HMAC-SHA512 theo tài liệu VNPay.
/// https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
/// </summary>
public static class VnpayLibrary
{
    // Ghép query string + vnp_SecureHash để redirect khách sang VNPay
    public static string CreatePaymentUrl(
        string baseUrl,
        string hashSecret,
        IDictionary<string, string> data)
    {
        var sorted = new SortedDictionary<string, string>(StringComparer.Ordinal);
        foreach (var (key, value) in data)
        {
            if (!string.IsNullOrEmpty(value))
                sorted[key] = value;
        }

        var query = new StringBuilder();
        var hashData = new StringBuilder();
        var i = 0;

        // Sort A-Z → urlencode → nối bằng & → HMAC-SHA512
        foreach (var (key, value) in sorted)
        {
            var encodedKey = WebUtility.UrlEncode(key);
            var encodedValue = WebUtility.UrlEncode(value);

            query.Append(encodedKey).Append('=').Append(encodedValue).Append('&');

            if (i > 0)
                hashData.Append('&');
            hashData.Append(encodedKey).Append('=').Append(encodedValue);
            i++;
        }

        var secureHash = HmacSha512(hashSecret, hashData.ToString());
        query.Append("vnp_SecureHash=").Append(secureHash);

        return $"{baseUrl}?{query}";
    }

    // Kiểm tra vnp_SecureHash khi VNPay gọi IPN hoặc ReturnUrl
    public static bool ValidateSignature(NameValueCollection query, string hashSecret, out Dictionary<string, string> data)
    {
        data = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        string? secureHash = null;

        foreach (var key in query.AllKeys)
        {
            if (string.IsNullOrEmpty(key))
                continue;

            var value = query[key] ?? string.Empty;
            if (key.Equals("vnp_SecureHash", StringComparison.OrdinalIgnoreCase))
            {
                secureHash = value;
                continue;
            }

            if (key.StartsWith("vnp_", StringComparison.OrdinalIgnoreCase))
                data[key] = value;
        }

        if (string.IsNullOrEmpty(secureHash))
            return false;

        var sorted = new SortedDictionary<string, string>(StringComparer.Ordinal);
        foreach (var (key, value) in data)
        {
            if (!string.IsNullOrEmpty(value))
                sorted[key] = value;
        }

        var hashData = new StringBuilder();
        var i = 0;
        foreach (var (key, value) in sorted)
        {
            if (i > 0)
                hashData.Append('&');
            hashData.Append(WebUtility.UrlEncode(key)).Append('=').Append(WebUtility.UrlEncode(value));
            i++;
        }

        var calculated = HmacSha512(hashSecret, hashData.ToString());
        return string.Equals(calculated, secureHash, StringComparison.OrdinalIgnoreCase);
    }

    public static string HmacSha512(string key, string data)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA512(keyBytes);
        var hash = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
