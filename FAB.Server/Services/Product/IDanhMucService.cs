using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Product;

public interface IDanhMucService
{
    Task<ServiceResult<List<DanhMucResponse>>> GetAllAsync(bool? activeOnly = null, CancellationToken ct = default);
    Task<ServiceResult<DanhMucResponse>> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<DanhMucResponse>> CreateAsync(DanhMucRequest request, CancellationToken ct = default);
    Task<ServiceResult<DanhMucResponse>> UpdateAsync(int id, DanhMucRequest request, CancellationToken ct = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default);
}
