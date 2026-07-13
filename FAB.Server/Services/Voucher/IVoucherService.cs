using FAB.Server.Common;
using FAB.Server.Models.DTOs.Voucher;

namespace FAB.Server.Services.Voucher;

public interface IVoucherService
{
    Task<ServiceResult<VoucherApplyResponse>> ValidateAsync(
        string maCode, decimal subtotal, string? email, CancellationToken ct = default);

    Task<ServiceResult<List<VoucherListItemDto>>> GetAllAsync(CancellationToken ct = default);

    Task<ServiceResult<VoucherListItemDto>> CreateAsync(CreateVoucherRequest request, CancellationToken ct = default);

    Task<ServiceResult<VoucherListItemDto>> UpdateAsync(
        int maVoucher, UpdateVoucherRequest request, CancellationToken ct = default);

    Task<ServiceResult> DeleteAsync(int maVoucher, CancellationToken ct = default);

    Task<ServiceResult> MarkUsedAsync(int maVoucher, CancellationToken ct = default);
}
