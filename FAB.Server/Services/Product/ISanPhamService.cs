using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Product;

public interface ISanPhamService
{
    Task<ServiceResult<PagedResult<SanPhamListItemResponse>>> GetPagedAsync(
        int page,
        int pageSize,
        string? search,
        int? maDanhMuc,
        bool? trangThai,
        string? sort,
        CancellationToken ct = default);

    Task<ServiceResult<List<ProductSearchTagDto>>> GetSearchTagsAsync(CancellationToken ct = default);

    Task<ServiceResult<SanPhamDetailResponse>> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<SanPhamDetailResponse>> CreateAsync(SanPhamCreateRequest request, CancellationToken ct = default);
    Task<ServiceResult<SanPhamDetailResponse>> UpdateAsync(int id, SanPhamUpdateRequest request, CancellationToken ct = default);
    Task<ServiceResult<SanPhamDetailResponse>> ApplyHotDealAsync(int id, int phanTramGiam, CancellationToken ct = default);
    Task<ServiceResult<SanPhamDetailResponse>> RemoveHotDealAsync(int id, CancellationToken ct = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default);
}
