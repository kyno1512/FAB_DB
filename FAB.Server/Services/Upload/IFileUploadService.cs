using FAB.Server.Common;
using Microsoft.AspNetCore.Http;

namespace FAB.Server.Services.Upload;

public interface IFileUploadService
{
    Task<ServiceResult<string>> SaveAvatarAsync(IFormFile file, int maNguoiDung, CancellationToken ct = default);

    Task<ServiceResult<List<string>>> SaveNewsImagesAsync(IReadOnlyList<IFormFile> files, CancellationToken ct = default);

    Task<ServiceResult<string>> SaveProductImageAsync(IFormFile file, CancellationToken ct = default);
}
