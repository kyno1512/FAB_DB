using FAB.Server.Common;
using FAB.Server.Models.DTOs.News;

namespace FAB.Server.Services.Admin;

public interface INewsAdminService
{
    Task<ServiceResult<List<NewsPostDto>>> GetAllAsync(string? search = null, CancellationToken ct = default);
    Task<ServiceResult<NewsPostDto>> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<NewsPostDto>> CreateAsync(UpsertNewsRequest request, CancellationToken ct = default);
    Task<ServiceResult<NewsPostDto>> UpdateAsync(int id, UpsertNewsRequest request, CancellationToken ct = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<int>> DeleteManyAsync(IReadOnlyList<int> ids, CancellationToken ct = default);
}
