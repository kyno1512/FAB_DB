using FAB.Server.Common;
using Microsoft.AspNetCore.Hosting;

namespace FAB.Server.Services.Upload;

public class FileUploadService : IFileUploadService
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
    };

    private const long MaxBytes = 5 * 1024 * 1024;
    private const int MaxNewsImages = 10;

    private readonly IWebHostEnvironment _env;

    public FileUploadService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public Task<ServiceResult<string>> SaveAvatarAsync(
        IFormFile file, int maNguoiDung, CancellationToken ct = default) =>
        SaveImageAsync(file, Path.Combine("uploads", "avatars"), $"{maNguoiDung}_{Guid.NewGuid():N}", ct);

    public async Task<ServiceResult<List<string>>> SaveNewsImagesAsync(
        IReadOnlyList<IFormFile> files, CancellationToken ct = default)
    {
        if (files.Count == 0)
            return ServiceResult<List<string>>.Fail("Vui lòng chọn ít nhất một ảnh.");

        if (files.Count > MaxNewsImages)
            return ServiceResult<List<string>>.Fail($"Tối đa {MaxNewsImages} ảnh mỗi lần tải lên.");

        var urls = new List<string>(files.Count);
        foreach (var file in files)
        {
            var result = await SaveImageAsync(file, Path.Combine("uploads", "news"), $"news_{Guid.NewGuid():N}", ct);
            if (!result.Success)
                return ServiceResult<List<string>>.Fail(result.Error ?? "Không thể tải ảnh lên.");

            urls.Add(result.Data!);
        }

        return ServiceResult<List<string>>.Ok(urls);
    }

    public Task<ServiceResult<string>> SaveProductImageAsync(
        IFormFile file, CancellationToken ct = default) =>
        SaveImageAsync(file, Path.Combine("uploads", "products"), $"product_{Guid.NewGuid():N}", ct);

    private async Task<ServiceResult<string>> SaveImageAsync(
        IFormFile file, string relativeFolder, string fileStem, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return ServiceResult<string>.Fail("Vui lòng chọn ảnh để tải lên.");

        if (file.Length > MaxBytes)
            return ServiceResult<string>.Fail("Ảnh không được lớn hơn 5MB.");

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
            return ServiceResult<string>.Fail("Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.");

        var webRoot = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        var uploadsDir = Path.Combine(webRoot, relativeFolder);
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{fileStem}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadsDir, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream, ct);

        var urlPath = "/" + relativeFolder.Replace('\\', '/').Trim('/') + "/" + fileName;
        return ServiceResult<string>.Ok(urlPath);
    }
}
