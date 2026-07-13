using FAB.Server.Common;

namespace FAB.Server.Services.Inventory;

public interface IOrderInventoryService
{
    Task<ServiceResult> ValidateOrderLinesAsync(
        IReadOnlyList<OrderInventoryLine> lines,
        CancellationToken ct = default);

    Task<ServiceResult> CheckStockAsync(
        IReadOnlyList<OrderInventoryLine> lines,
        CancellationToken ct = default);

    Task<ServiceResult> DeductForOrderAsync(
        int maDonHang,
        int? nguoiThucHien = null,
        CancellationToken ct = default);

    Task<ServiceResult> RestoreForOrderAsync(
        int maDonHang,
        int? nguoiThucHien = null,
        CancellationToken ct = default);

    Task<bool> HasDeductedForOrderAsync(int maDonHang, CancellationToken ct = default);

    Task<int> GetMaxAvailableAsync(int maSanPham, CancellationToken ct = default);

    Task<Dictionary<int, int>> GetMaxAvailableBatchAsync(IReadOnlyList<int> maSanPhams, CancellationToken ct = default);
}

public record OrderInventoryLine(int MaSanPham, int SoLuong);
