using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Admin;

public interface IStaffAdminService
{
    Task<ServiceResult<List<RoleListItemDto>>> GetRolesAsync(CancellationToken ct = default);
    Task<ServiceResult<List<StaffListItemDto>>> GetAllAsync(string? search = null, CancellationToken ct = default);
    Task<ServiceResult<StaffListItemDto>> GetByIdAsync(int maNguoiDung, CancellationToken ct = default);
    Task<ServiceResult<StaffListItemDto>> CreateAsync(CreateStaffRequest request, CancellationToken ct = default);
    Task<ServiceResult<StaffListItemDto>> UpdateAsync(int maNguoiDung, UpdateStaffRequest request, CancellationToken ct = default);
    Task<ServiceResult> DeleteAsync(int maNguoiDung, CancellationToken ct = default);
    Task<ServiceResult<StaffModulePermissionsResponse>> GetModulePermissionsAsync(int maNguoiDung, CancellationToken ct = default);
    Task<ServiceResult> UpdateModulePermissionsAsync(int maNguoiDung, UpdateStaffPermissionsRequest request, CancellationToken ct = default);
}
