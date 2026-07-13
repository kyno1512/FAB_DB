using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Models.DTOs.Order;

namespace FAB.Server.Services.Order;

public interface IOrderService
{
    Task<ServiceResult<OrderResponse>> CreateAsync(CreateOrderRequest request, CancellationToken ct = default);
    Task<ServiceResult<List<AdminOrderListResponse>>> GetAllAsync(string? trangThai = null, string? trangThaiHuy = null, string? loai = null, CancellationToken ct = default);
    Task<ServiceResult<List<CustomerOrderListResponse>>> GetMyOrdersAsync(int maNguoiDung, CancellationToken ct = default);
    Task<ServiceResult<CustomerOrderDetailResponse>> GetMyOrderDetailAsync(int maDonHang, int maNguoiDung, CancellationToken ct = default);
    Task<ServiceResult<AdminOrderDetailResponse>> GetByIdAsync(int maDonHang, CancellationToken ct = default);
    Task<ServiceResult> UpdateStatusAsync(int maDonHang, UpdateOrderStatusRequest request, CancellationToken ct = default);
    Task<ServiceResult<List<ShipperListItemDto>>> GetInternalShippersAsync(CancellationToken ct = default);
    Task<ServiceResult> DeleteManyAsync(IReadOnlyList<int> ids, CancellationToken ct = default);
    Task<ServiceResult<AdminOrderDetailResponse>> GetByTrackingTokenAsync(string token, CancellationToken ct = default);
    Task<ServiceResult> CancelByTrackingTokenAsync(string token, CancellationToken ct = default);
    Task<ServiceResult> CancelMyOrderAsync(int maDonHang, int maNguoiDung, CancellationToken ct = default);

    // === Hoàn tiền ===
    Task<ServiceResult<CancelOrderResponse>> RequestCancelAsync(int maDonHang, int maNguoiDung, CancelOrderRequest request, CancellationToken ct = default);
    Task<ServiceResult> ProcessRefundAsync(int maDonHang, ProcessRefundRequest request, int maNguoiDung, CancellationToken ct = default);
    Task<ServiceResult<List<RefundHistoryDto>>> GetRefundHistoryAsync(int maDonHang, CancellationToken ct = default);

    // === Cập nhật thông tin khách ===
    Task<ServiceResult<AdminOrderDetailResponse>> UpdateCustomerInfoAsync(int maDonHang, UpdateCustomerInfoRequest request, CancellationToken ct = default);
}
