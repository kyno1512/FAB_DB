using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Product;

public static class ProductReviewConstants
{
    public const string GuestDisplayName = "Khách hàng";
}

public interface IProductReviewService
{
    Task<ServiceResult<ProductReviewPageDto>> GetByProductAsync(
        int maSanPham, int page, int pageSize, CancellationToken ct = default);

    Task<ServiceResult<ProductReviewItemDto>> CreateAsync(
        int maSanPham, int? maNguoiDung, CreateProductReviewRequest request, CancellationToken ct = default);
}
