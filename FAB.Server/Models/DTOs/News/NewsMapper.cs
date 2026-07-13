using System.Text.Json;
using FAB.Server.Models;
using FAB.Server.Models.DTOs.News;

namespace FAB.Server.Models.DTOs.News;

public static class NewsMapper
{
    public static NewsPostDto ToDto(TinTuc row) => new()
    {
        MaTinTuc = row.MaTinTuc,
        TieuDe = row.TieuDe,
        DanhMuc = row.DanhMuc,
        TomTat = row.TomTat,
        NoiDung = row.NoiDung,
        AnhDaiDien = row.AnhDaiDien,
        AnhPhu = DeserializeExtraImages(row.AnhPhu),
        TrangThai = row.TrangThai,
        NgayDang = row.NgayDang,
        NgayTao = row.NgayTao,
        NgayCapNhat = row.NgayCapNhat,
    };

    public static string? SerializeExtraImages(IReadOnlyList<string>? urls)
    {
        var cleaned = urls?
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return cleaned is { Count: > 0 }
            ? JsonSerializer.Serialize(cleaned)
            : null;
    }

    public static List<string>? DeserializeExtraImages(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;

        try
        {
            return JsonSerializer.Deserialize<List<string>>(raw);
        }
        catch
        {
            return null;
        }
    }
}
