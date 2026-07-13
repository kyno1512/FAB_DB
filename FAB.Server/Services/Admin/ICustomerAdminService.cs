using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Admin;

public interface ICustomerAdminService
{
    Task<ServiceResult<PagedResult<CustomerListItemDto>>> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default);
    Task<ServiceResult<CustomerDetailResponse>> GetByIdAsync(int maKhachHang, CancellationToken ct = default);
    Task<ServiceResult<CustomerDetailResponse>> UpdateAsync(
        int maKhachHang, UpdateCustomerRequest request, CancellationToken ct = default);
    Task<ServiceResult> DeleteAsync(int maKhachHang, CancellationToken ct = default);
    Task<ServiceResult> DeleteManyAsync(IReadOnlyList<int> ids, CancellationToken ct = default);
    Task<ServiceResult> ResetPasswordAsync(
        int maKhachHang, AdminResetPasswordRequest request, CancellationToken ct = default);
}
