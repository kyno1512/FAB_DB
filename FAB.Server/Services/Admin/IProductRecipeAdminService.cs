using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Admin;

public interface IProductRecipeAdminService
{
    Task<ServiceResult<PagedResult<ProductRecipeListItemDto>>> GetPagedAsync(
        int page,
        int pageSize,
        string? search,
        string? filter,
        CancellationToken ct = default);

    Task<ServiceResult<ProductRecipeStatsDto>> GetStatsAsync(CancellationToken ct = default);

    Task<ServiceResult<ProductRecipeDetailDto>> GetByProductIdAsync(int maSanPham, CancellationToken ct = default);

    Task<ServiceResult<ProductRecipeDetailDto>> UpdateAsync(
        int maSanPham,
        UpdateProductRecipeRequest request,
        CancellationToken ct = default);

    Task<ServiceResult> DeleteAsync(int maSanPham, int maCongThuc, CancellationToken ct = default);

    Task<ServiceResult> DeleteMultipleAsync(List<int> maCongThucIds, CancellationToken ct = default);
}
