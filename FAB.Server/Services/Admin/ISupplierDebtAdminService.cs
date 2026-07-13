using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Models.DTOs.SupplierDebt;

namespace FAB.Server.Services.Admin;

public interface ISupplierDebtAdminService
{
    Task<ServiceResult<SupplierDebtSummaryDto>> GetSummaryAsync(CancellationToken ct = default);

    Task<ServiceResult<PagedResult<SupplierListItemDto>>> GetSuppliersAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default);

    Task<ServiceResult<SupplierListItemDto>> CreateSupplierAsync(
        UpsertSupplierRequest request, CancellationToken ct = default);

    Task<ServiceResult<SupplierListItemDto>> UpdateSupplierAsync(
        int id, UpsertSupplierRequest request, CancellationToken ct = default);

    Task<ServiceResult<string>> DeleteSupplierAsync(int id, CancellationToken ct = default);

    Task<ServiceResult<PagedResult<SupplierDebtItemDto>>> GetDebtsAsync(
        int page, int pageSize, string? search = null, int? maNhaCungCap = null,
        string? trangThaiThanhToan = null, CancellationToken ct = default);

    Task<ServiceResult<SupplierDebtItemDto>> RecordPaymentAsync(
        int maPhieuNhap, RecordSupplierPaymentRequest request, CancellationToken ct = default);

    Task<ServiceResult<SupplierDebtItemDto>> AssignSupplierAsync(
        int maPhieuNhap, AssignSupplierToReceiptRequest request, CancellationToken ct = default);
}
