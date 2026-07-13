using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Models.DTOs.Order;
using FAB.Server.Services.Order;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>Đơn hàng của tài khoản đang đăng nhập</summary>
    [Authorize]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var maNguoiDung))
            return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });

        var result = await _orderService.GetMyOrdersAsync(maNguoiDung, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data ?? []);
    }

    /// <summary>Chi tiết đơn hàng của tài khoản đang đăng nhập</summary>
    [Authorize]
    [HttpGet("my/{id:int}")]
    public async Task<IActionResult> GetMyOrderDetail(int id, CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var maNguoiDung))
            return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });

        var result = await _orderService.GetMyOrderDetailAsync(id, maNguoiDung, ct);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Khách hàng tạo đơn hàng mới</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var result = await _orderService.CreateAsync(request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Admin: Lấy danh sách tất cả đơn hàng</summary>
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? trangThai,
        [FromQuery] string? trangThaiHuy,
        [FromQuery] string? loai,
        CancellationToken ct)
    {
        var result = await _orderService.GetAllAsync(trangThai, trangThaiHuy, loai, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Admin: Danh sách shipper / nhân viên nội bộ</summary>
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpGet("admin/shippers")]
    public async Task<IActionResult> GetShippers(CancellationToken ct)
    {
        var result = await _orderService.GetInternalShippersAsync(ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Admin: Xem chi tiết một đơn hàng</summary>
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpGet("admin/{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var result = await _orderService.GetByIdAsync(id, ct);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Admin: Cập nhật trạng thái đơn hàng</summary>
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPut("admin/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        var result = await _orderService.UpdateStatusAsync(id, request, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>Admin: Xóa nhiều đơn hàng</summary>
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpDelete("admin/bulk")]
    public async Task<IActionResult> DeleteMany([FromBody] DeleteOrdersRequest request, CancellationToken ct)
    {
        var result = await _orderService.DeleteManyAsync(request.Ids, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>Khách vãng lai: Theo dõi đơn hàng qua Token</summary>
    [AllowAnonymous]
    [HttpGet("track")]
    public async Task<IActionResult> TrackOrderByToken([FromQuery] string t, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(t))
            return BadRequest(new { message = "Mã theo dõi không hợp lệ." });

        var result = await _orderService.GetByTrackingTokenAsync(t, ct);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Khách vãng lai: Hủy đơn qua Token (chỉ khi còn Chờ thanh toán / Chờ bếp)</summary>
    [AllowAnonymous]
    [HttpPost("track/cancel")]
    public async Task<IActionResult> CancelByTrackingToken([FromQuery] string t, CancellationToken ct)
    {
        var result = await _orderService.CancelByTrackingTokenAsync(t, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>Khách đăng nhập: Hủy đơn của mình (có lý do, chuyển sang "Chờ hoàn tiền")</summary>
    [Authorize]
    [HttpPost("my/{id:int}/cancel")]
    public async Task<IActionResult> CancelMyOrder(int id, [FromBody] CancelOrderRequest request, CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var maNguoiDung))
            return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });

        var result = await _orderService.RequestCancelAsync(id, maNguoiDung, request, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Admin: Xử lý hoàn tiền cho đơn đã yêu cầu hủy</summary>
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPost("admin/{id:int}/refund")]
    public async Task<IActionResult> ProcessRefund(int id, [FromBody] ProcessRefundRequest request, CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var maNguoiDung))
            return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });

        var result = await _orderService.ProcessRefundAsync(id, request, maNguoiDung, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    /// <summary>Admin: Lấy lịch sử hoàn tiền của đơn hàng</summary>
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpGet("admin/{id:int}/refund-history")]
    public async Task<IActionResult> GetRefundHistory(int id, CancellationToken ct)
    {
        var result = await _orderService.GetRefundHistoryAsync(id, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    /// <summary>Admin: Cập nhật SĐT / Email của đơn hàng</summary>
    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPut("admin/{id:int}/customer")]
    public async Task<IActionResult> UpdateCustomerInfo(int id, [FromBody] UpdateCustomerInfoRequest request, CancellationToken ct)
    {
        var result = await _orderService.UpdateCustomerInfoAsync(id, request, ct);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }
}
