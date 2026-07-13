using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using FAB.Server.Models.DTOs.Order;
using FAB.Server.Services.Inventory;
using FAB.Server.Services.Voucher;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Order;

public class OrderService : IOrderService
{
    private readonly FabDbContext _context;
    private readonly IInvoiceEmailService _invoiceEmailService;
    private readonly IOrderConfirmationEmailService _orderConfirmationEmailService;
    private readonly IVoucherService _voucherService;
    private readonly IOrderInventoryService _orderInventoryService;
    private readonly ILogger<OrderService> _logger;

    private static readonly string[] ShipperRoles = ["Shipper", "NhanVien", "QuanLy"];
    private static readonly HashSet<string> CustomerCancellableStatuses = new(StringComparer.Ordinal)
    {
        "ChoThanhToan",
        "ChoBep",
    };

    public OrderService(
        FabDbContext context,
        IInvoiceEmailService invoiceEmailService,
        IOrderConfirmationEmailService orderConfirmationEmailService,
        IVoucherService voucherService,
        IOrderInventoryService orderInventoryService,
        ILogger<OrderService> logger)
    {
        _context = context;
        _invoiceEmailService = invoiceEmailService;
        _orderConfirmationEmailService = orderConfirmationEmailService;
        _voucherService = voucherService;
        _orderInventoryService = orderInventoryService;
        _logger = logger;
    }

    public async Task<ServiceResult<OrderResponse>> CreateAsync(CreateOrderRequest request, CancellationToken ct = default)
    {
        if (request.Items is null || request.Items.Count == 0)
            return ServiceResult<OrderResponse>.Fail("Giỏ hàng trống.");

        if (string.IsNullOrWhiteSpace(request.HoTen))
            return ServiceResult<OrderResponse>.Fail("Vui lòng nhập họ tên người nhận.");

        if (string.IsNullOrWhiteSpace(request.SoDienThoai))
            return ServiceResult<OrderResponse>.Fail("Vui lòng nhập số điện thoại.");

        if (string.IsNullOrWhiteSpace(request.Email))
            return ServiceResult<OrderResponse>.Fail("Vui lòng nhập email nhận xác nhận.");

        var email = StringNormalizer.NormalizeEmail(request.Email);
        if (!email.Contains('@') || email.IndexOf('@') != email.LastIndexOf('@'))
            return ServiceResult<OrderResponse>.Fail("Email không hợp lệ.");
        request.Email = email;

        if (string.IsNullOrWhiteSpace(request.DiaChi))
            return ServiceResult<OrderResponse>.Fail("Vui lòng nhập địa chỉ giao hàng.");

        var shippingResult = ShippingFeeCalculator.Calculate(request.DiaChi);
        if (!shippingResult.Success)
            return ServiceResult<OrderResponse>.Fail(shippingResult.Error ?? "Địa chỉ giao hàng không hợp lệ.");
        var phiGiaoHang = shippingResult.Data;

        var productIds = request.Items.Select(x => x.MaSanPham).Distinct().ToList();
        var products = await _context.SanPhams
            .AsNoTracking()
            .Where(x => productIds.Contains(x.MaSanPham) && x.TrangThai)
            .ToDictionaryAsync(x => x.MaSanPham, ct);

        if (products.Count != productIds.Count)
            return ServiceResult<OrderResponse>.Fail("Có sản phẩm không tồn tại hoặc đã ngừng bán.");

        decimal subtotal = 0;
        var details = new List<ChiTietDonHang>();

        foreach (var item in request.Items)
        {
            if (item.SoLuong < 1)
                return ServiceResult<OrderResponse>.Fail("Số lượng không hợp lệ.");

            var product = products[item.MaSanPham];
            var lineTotal = product.GiaBan * item.SoLuong;
            subtotal += lineTotal;

            details.Add(new ChiTietDonHang
            {
                MaSanPham = product.MaSanPham,
                SoLuong = item.SoLuong,
                DonGia = product.GiaBan,
                ThanhTien = lineTotal,
            });
        }

        int? maKhachHang = null;
        if (request.MaNguoiDung.HasValue)
        {
            maKhachHang = await _context.KhachHangs
                .Where(x => x.MaNguoiDung == request.MaNguoiDung.Value)
                .Select(x => (int?)x.MaKhachHang)
                .FirstOrDefaultAsync(ct);
        }

        var isCod = string.Equals(request.PhuongThucThanhToan, "COD", StringComparison.OrdinalIgnoreCase);
        var now = DateTime.Now;

        decimal soTienGiam = 0;
        int? maVoucher = null;

        if (!string.IsNullOrWhiteSpace(request.MaCode))
        {
            var voucherResult = await _voucherService.ValidateAsync(
                request.MaCode, subtotal, request.Email, ct);

            if (!voucherResult.Success)
                return ServiceResult<OrderResponse>.Fail(voucherResult.Error ?? "Mã khuyến mãi không hợp lệ.");

            soTienGiam = voucherResult.Data!.SoTienGiam;
            maVoucher = voucherResult.Data.MaVoucher;
        }

        var tongThanhToan = subtotal - soTienGiam + phiGiaoHang;

        var inventoryLines = request.Items
            .Select(x => new OrderInventoryLine(x.MaSanPham, x.SoLuong))
            .ToList();

        var stockCheck = await _orderInventoryService.ValidateOrderLinesAsync(inventoryLines, ct);
        if (!stockCheck.Success)
            return ServiceResult<OrderResponse>.Fail(stockCheck.Message ?? "Không đủ nguyên liệu trong kho.");

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
        var order = new DonHang
        {
            MaKhachHang = maKhachHang,
            MaNguoiTao = request.MaNguoiDung,
            MaVoucher = maVoucher,
            LoaiDonHang = "GiaoTanNoi",
            TrangThai = isCod ? "ChoBep" : "ChoThanhToan",
            GhiChu = BuildOrderNote(request),
            TongTamTinh = subtotal,
            SoTienGiam = soTienGiam,
            TongThanhToan = tongThanhToan,
            NgayTao = now,
            TrackingToken = Guid.NewGuid().ToString("N"),
            SoDienThoai = request.SoDienThoai?.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : StringNormalizer.NormalizeEmail(request.Email),
            ChiTietDonHangs = details,
        };

        _context.DonHangs.Add(order);
        await _context.SaveChangesAsync(ct);

        _context.GiaoHangs.Add(new GiaoHang
        {
            MaDonHang = order.MaDonHang,
            DiaChiGiao = request.DiaChi.Trim(),
            NguoiNhan = request.HoTen.Trim(),
            SdtnguoiNhan = request.SoDienThoai.Trim(),
            TrangThai = "ChoLayHang",
            PhiGiaoHang = phiGiaoHang,
            GhiChu = request.GhiChu,
            NgayTao = now,
        });
        await _context.SaveChangesAsync(ct);

        var invoice = new HoaDon
        {
            MaDonHang = order.MaDonHang,
            SoHoaDon = $"HD{now:yyyyMMdd}{order.MaDonHang:D6}",
            TongTien = subtotal,
            SoTienGiam = soTienGiam,
            TongThanhToan = tongThanhToan,
            TrangThai = isCod ? "COD" : "ChuaThanhToan",
            NgayTao = now,
        };

        _context.HoaDons.Add(invoice);
        await _context.SaveChangesAsync(ct);

        if (isCod)
        {
            _context.ThanhToans.Add(new ThanhToan
            {
                MaHoaDon = invoice.MaHoaDon,
                PhuongThucThanhToan = "COD",
                SoTien = tongThanhToan,
                TrangThai = "ChoThuTien",
                ThoiGianThanhToan = now,
                GhiChu = "Thanh toan khi nhan hang",
            });
            await _context.SaveChangesAsync(ct);
        }

        if (maVoucher.HasValue)
            await _voucherService.MarkUsedAsync(maVoucher.Value, ct);

        // Kiểm tra tồn kho cho cả COD và VNPay trước khi commit
        var deductResult = await _orderInventoryService.DeductForOrderAsync(order.MaDonHang, request.MaNguoiDung, ct);
        if (!deductResult.Success)
        {
            await tx.RollbackAsync(ct);
            return ServiceResult<OrderResponse>.Fail(deductResult.Message ?? "Không thể trừ kho nguyên liệu.");
        }

        await tx.CommitAsync(ct);

        // Gửi email trong background để user nhận phản hồi ngay lập tức
        if (isCod)
        {
            var orderId = order.MaDonHang;
            _ = Task.Run(async () =>
            {
                try
                {
                    await _orderConfirmationEmailService.SendConfirmationAsync(orderId, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Gửi email xác nhận đặt hàng thất bại cho đơn #{OrderId}", orderId);
                }
            });
        }

        return ServiceResult<OrderResponse>.Ok(new OrderResponse
        {
            MaDonHang = order.MaDonHang,
            MaHoaDon = invoice.MaHoaDon,
            SoHoaDon = invoice.SoHoaDon,
            TongThanhToan = order.TongThanhToan,
            TrackingToken = order.TrackingToken,
            EmailSent = false,
        });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            _logger.LogError(ex, "Lỗi khi tạo đơn hàng");
            var innerMsg = ex.InnerException?.Message ?? ex.Message;
            return ServiceResult<OrderResponse>.Fail($"Lỗi khi tạo đơn: {innerMsg}");
        }
    }

    public async Task<ServiceResult<List<AdminOrderListResponse>>> GetAllAsync(
        string? trangThai = null, string? trangThaiHuy = null, string? loai = null, CancellationToken ct = default)
    {
        var query = _context.DonHangs
            .Include(d => d.ChiTietDonHangs).ThenInclude(c => c.MaSanPhamNavigation)
            .Include(d => d.MaKhachHangNavigation)
            .Include(d => d.GiaoHangs).ThenInclude(g => g.MaShipperNavigation)
            .Include(d => d.HoaDon)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(trangThai))
            query = query.Where(d => d.TrangThai == trangThai);

        if (!string.IsNullOrWhiteSpace(trangThaiHuy))
            query = query.Where(d => d.TrangThaiHuy == trangThaiHuy);

        if (!string.IsNullOrWhiteSpace(loai))
            query = query.Where(d => d.LoaiDonHang == loai);

        var orders = await query
            .OrderByDescending(d => d.NgayTao)
            .ToListAsync(ct);

        var result = orders
            .Select(d => new AdminOrderListResponse
            {
                MaDonHang = d.MaDonHang,
                TenKhachHang = d.MaKhachHangNavigation != null ? d.MaKhachHangNavigation.HoTen : null,
                SoDienThoai = d.MaKhachHangNavigation != null ? d.MaKhachHangNavigation.SoDienThoai : null,
                LoaiDonHang = d.LoaiDonHang,
                TrangThai = d.TrangThai,
                TongThanhToan = d.TongThanhToan,
                GhiChu = d.GhiChu,
                NgayTao = d.NgayTao,
                SoMon = d.ChiTietDonHangs.Count,
                PhuongThucThanhToan = d.HoaDon != null && d.HoaDon.TrangThai == "COD" ? "COD" : "VNPAY",
                TrangThaiThanhToan = d.HoaDon != null ? d.HoaDon.TrangThai : null,
                DiaChiGiao = d.GiaoHangs
                    .OrderByDescending(g => g.NgayTao)
                    .Select(g => g.DiaChiGiao)
                    .FirstOrDefault(),
                NguoiNhan = d.GiaoHangs
                    .OrderByDescending(g => g.NgayTao)
                    .Select(g => g.NguoiNhan)
                    .FirstOrDefault(),
                SDTNguoiNhan = d.GiaoHangs
                    .OrderByDescending(g => g.NgayTao)
                    .Select(g => g.SdtnguoiNhan)
                    .FirstOrDefault(),
                TrangThaiGiao = d.GiaoHangs
                    .OrderByDescending(g => g.NgayTao)
                    .Select(g => g.TrangThai)
                    .FirstOrDefault(),
                TenShipper = d.GiaoHangs
                    .OrderByDescending(g => g.NgayTao)
                    .Select(g => g.MaShipperNavigation != null ? g.MaShipperNavigation.HoTen : null)
                    .FirstOrDefault(),
                Items = d.ChiTietDonHangs.Select(c => new OrderDetailItemDto
                {
                    MaSanPham = c.MaSanPham,
                    TenSanPham = c.MaSanPhamNavigation != null ? c.MaSanPhamNavigation.TenSanPham : "",
                    SoLuong = c.SoLuong,
                    DonGia = c.DonGia,
                    ThanhTien = c.ThanhTien ?? 0,
                }).ToList(),
                YeuCauHuy = d.YeuCauHuy,
                TrangThaiHuy = d.TrangThaiHuy,
                LyDoHuy = d.LyDoHuy,
                NgayYeuCauHuy = d.NgayYeuCauHuy,
                SoTienHoan = d.SoTienHoan,
                NgayHoanTien = d.NgayHoanTien,
            })
            .ToList();

        return ServiceResult<List<AdminOrderListResponse>>.Ok(result);
    }

    public async Task<ServiceResult<List<CustomerOrderListResponse>>> GetMyOrdersAsync(
        int maNguoiDung, CancellationToken ct = default)
    {
        var maKhachHang = await _context.KhachHangs
            .AsNoTracking()
            .Where(k => k.MaNguoiDung == maNguoiDung)
            .Select(k => (int?)k.MaKhachHang)
            .FirstOrDefaultAsync(ct);

        var orders = _context.DonHangs
            .Include(d => d.ChiTietDonHangs)
            .Include(d => d.HoaDon)
            .Include(d => d.GiaoHangs)
            .AsNoTracking()
            .Where(d => d.MaNguoiTao == maNguoiDung || (maKhachHang != null && d.MaKhachHang == maKhachHang))
            .OrderByDescending(d => d.NgayTao)
            .ToList();

        var result = orders
            .Select(d => new CustomerOrderListResponse
            {
                MaDonHang = d.MaDonHang,
                TrangThai = d.TrangThai,
                TongThanhToan = d.TongThanhToan,
                NgayTao = d.NgayTao,
                SoMon = d.ChiTietDonHangs.Count,
                PhuongThucThanhToan = d.HoaDon != null && d.HoaDon.TrangThai == "COD" ? "COD" : "VNPAY",
                TrangThaiThanhToan = d.HoaDon != null ? d.HoaDon.TrangThai : null,
                DiaChiGiao = d.GiaoHangs
                    .OrderByDescending(g => g.NgayTao)
                    .Select(g => g.DiaChiGiao)
                    .FirstOrDefault(),
                NguoiNhan = d.GiaoHangs
                    .OrderByDescending(g => g.NgayTao)
                    .Select(g => g.NguoiNhan)
                    .FirstOrDefault(),
                YeuCauHuy = d.YeuCauHuy,
                TrangThaiHuy = d.TrangThaiHuy,
                LyDoHuy = d.LyDoHuy,
                NgayYeuCauHuy = d.NgayYeuCauHuy,
                SoTienHoan = d.SoTienHoan,
                NgayHoanTien = d.NgayHoanTien,
            })
            .ToList();

        return ServiceResult<List<CustomerOrderListResponse>>.Ok(result);
    }

    public async Task<ServiceResult<CustomerOrderDetailResponse>> GetMyOrderDetailAsync(
        int maDonHang, int maNguoiDung, CancellationToken ct = default)
    {
        var maKhachHang = await _context.KhachHangs
            .AsNoTracking()
            .Where(k => k.MaNguoiDung == maNguoiDung)
            .Select(k => (int?)k.MaKhachHang)
            .FirstOrDefaultAsync(ct);

        var order = await _context.DonHangs
            .Include(d => d.ChiTietDonHangs).ThenInclude(c => c.MaSanPhamNavigation).ThenInclude(s => s.HinhAnhSanPhams)
            .Include(d => d.GiaoHangs)
            .Include(d => d.HoaDon)
            .AsNoTracking()
            .FirstOrDefaultAsync(d =>
                (d.MaNguoiTao == maNguoiDung || (maKhachHang != null && d.MaKhachHang == maKhachHang))
                && d.MaDonHang == maDonHang, ct);

        if (order is null)
            return ServiceResult<CustomerOrderDetailResponse>.Fail("Không tìm thấy đơn hàng.");

        var delivery = order.GiaoHangs.OrderByDescending(g => g.NgayTao).FirstOrDefault();

        var response = new CustomerOrderDetailResponse
        {
            MaDonHang = order.MaDonHang,
            TrangThai = order.TrangThai,
            TongTamTinh = order.TongTamTinh,
            SoTienGiam = order.SoTienGiam,
            TongThanhToan = order.TongThanhToan,
            NgayTao = order.NgayTao,
            PhuongThucThanhToan = order.HoaDon?.TrangThai == "COD" ? "COD" : "VNPay",
            TrangThaiThanhToan = order.HoaDon?.TrangThai,
            Items = order.ChiTietDonHangs.Select(c => new OrderDetailItemDto
            {
                MaSanPham = c.MaSanPham,
                TenSanPham = c.MaSanPhamNavigation?.TenSanPham ?? "",
                HinhAnh = c.MaSanPhamNavigation?.HinhAnhSanPhams?.FirstOrDefault()?.DuongDan,
                SoLuong = c.SoLuong,
                DonGia = c.DonGia,
                ThanhTien = c.ThanhTien ?? 0,
            }).ToList(),
            GiaoHang = delivery != null ? new OrderDeliveryDto
            {
                MaGiaoHang = delivery.MaGiaoHang,
                DiaChiGiao = delivery.DiaChiGiao,
                NguoiNhan = delivery.NguoiNhan,
                SDTNguoiNhan = delivery.SdtnguoiNhan,
                TrangThai = delivery.TrangThai,
                PhiGiaoHang = delivery.PhiGiaoHang,
                GhiChu = delivery.GhiChu,
                NgayGiao = delivery.NgayGiao,
            } : null,
            YeuCauHuy = order.YeuCauHuy,
            TrangThaiHuy = order.TrangThaiHuy,
            LyDoHuy = order.LyDoHuy,
            NgayYeuCauHuy = order.NgayYeuCauHuy,
            SoTienHoan = order.SoTienHoan,
            NgayHoanTien = order.NgayHoanTien,
            MaGiaoDichHoan = order.MaGiaoDichHoan,
        };

        return ServiceResult<CustomerOrderDetailResponse>.Ok(response);
    }

    public async Task<ServiceResult<AdminOrderDetailResponse>> GetByIdAsync(int maDonHang, CancellationToken ct = default)
    {
        var order = await _context.DonHangs
            .Include(d => d.ChiTietDonHangs).ThenInclude(c => c.MaSanPhamNavigation).ThenInclude(s => s.HinhAnhSanPhams)
            .Include(d => d.MaKhachHangNavigation)
            .Include(d => d.GiaoHangs).ThenInclude(g => g.MaShipperNavigation)
            .Include(d => d.HoaDon)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.MaDonHang == maDonHang, ct);

        if (order is null)
            return ServiceResult<AdminOrderDetailResponse>.Fail("Không tìm thấy đơn hàng.");

        var delivery = order.GiaoHangs.OrderByDescending(g => g.NgayTao).FirstOrDefault();
        var paymentMethod = order.HoaDon?.TrangThai == "COD" ? "COD" : "VNPAY";

        var response = new AdminOrderDetailResponse
        {
            MaDonHang = order.MaDonHang,
            TenKhachHang = order.MaKhachHangNavigation?.HoTen,
            SoDienThoai = order.SoDienThoai ?? order.MaKhachHangNavigation?.SoDienThoai,
            Email = order.Email,
            LoaiDonHang = order.LoaiDonHang,
            TrangThai = order.TrangThai,
            TongTamTinh = order.TongTamTinh,
            SoTienGiam = order.SoTienGiam,
            TongThanhToan = order.TongThanhToan,
            GhiChu = order.GhiChu,
            NgayTao = order.NgayTao,
            SoHoaDon = order.HoaDon?.SoHoaDon,
            TrangThaiThanhToan = order.HoaDon?.TrangThai,
            PhuongThucThanhToan = paymentMethod,
            Items = order.ChiTietDonHangs.Select(c => new OrderDetailItemDto
            {
                MaSanPham = c.MaSanPham,
                TenSanPham = c.MaSanPhamNavigation?.TenSanPham ?? "",
                HinhAnh = c.MaSanPhamNavigation?.HinhAnhSanPhams
                    .Where(h => h.LaAnhChinh)
                    .Select(h => h.DuongDan)
                    .FirstOrDefault(),
                SoLuong = c.SoLuong,
                DonGia = c.DonGia,
                ThanhTien = c.ThanhTien ?? 0,
            }).ToList(),
            YeuCauHuy = order.YeuCauHuy,
            TrangThaiHuy = order.TrangThaiHuy,
            LyDoHuy = order.LyDoHuy,
            NgayYeuCauHuy = order.NgayYeuCauHuy,
            SoTienHoan = order.SoTienHoan,
            NgayHoanTien = order.NgayHoanTien,
            MaGiaoDichHoan = order.MaGiaoDichHoan,
            NguoiXuLyHoan = order.NguoiXuLyHoan,
        };

        if (delivery is not null)
        {
            response.GiaoHang = new OrderDeliveryDto
            {
                MaGiaoHang = delivery.MaGiaoHang,
                DiaChiGiao = delivery.DiaChiGiao,
                NguoiNhan = delivery.NguoiNhan,
                SDTNguoiNhan = delivery.SdtnguoiNhan,
                TrangThai = delivery.TrangThai,
                PhiGiaoHang = delivery.PhiGiaoHang,
                GhiChu = delivery.GhiChu,
                NgayGiao = delivery.NgayGiao,
                MaShipper = delivery.MaShipper,
                TenShipper = delivery.MaShipperNavigation?.HoTen,
            };
        }

        return ServiceResult<AdminOrderDetailResponse>.Ok(response);
    }

    public async Task<ServiceResult<AdminOrderDetailResponse>> GetByTrackingTokenAsync(string token, CancellationToken ct = default)
    {
        var order = await _context.DonHangs
            .Include(d => d.ChiTietDonHangs).ThenInclude(c => c.MaSanPhamNavigation).ThenInclude(s => s.HinhAnhSanPhams)
            .Include(d => d.MaKhachHangNavigation)
            .Include(d => d.GiaoHangs).ThenInclude(g => g.MaShipperNavigation)
            .Include(d => d.HoaDon)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.TrackingToken == token, ct);

        if (order is null)
            return ServiceResult<AdminOrderDetailResponse>.Fail("Không tìm thấy đơn hàng hoặc link theo dõi không hợp lệ.");

        var delivery = order.GiaoHangs.OrderByDescending(g => g.NgayTao).FirstOrDefault();
        var paymentMethod = order.HoaDon?.TrangThai == "COD" ? "COD" : "VNPAY";

        var response = new AdminOrderDetailResponse
        {
            MaDonHang = order.MaDonHang,
            TenKhachHang = order.MaKhachHangNavigation?.HoTen,
            SoDienThoai = order.SoDienThoai ?? order.MaKhachHangNavigation?.SoDienThoai,
            Email = order.Email,
            LoaiDonHang = order.LoaiDonHang,
            TrangThai = order.TrangThai,
            TongTamTinh = order.TongTamTinh,
            SoTienGiam = order.SoTienGiam,
            TongThanhToan = order.TongThanhToan,
            GhiChu = order.GhiChu,
            NgayTao = order.NgayTao,
            SoHoaDon = order.HoaDon?.SoHoaDon,
            TrangThaiThanhToan = order.HoaDon?.TrangThai,
            PhuongThucThanhToan = paymentMethod,
            YeuCauHuy = order.YeuCauHuy,
            TrangThaiHuy = order.TrangThaiHuy,
            LyDoHuy = order.LyDoHuy,
            NgayYeuCauHuy = order.NgayYeuCauHuy,
            SoTienHoan = order.SoTienHoan,
            NgayHoanTien = order.NgayHoanTien,
            MaGiaoDichHoan = order.MaGiaoDichHoan,
            NguoiXuLyHoan = order.NguoiXuLyHoan,
            Items = order.ChiTietDonHangs.Select(c => new OrderDetailItemDto
            {
                MaSanPham = c.MaSanPham,
                TenSanPham = c.MaSanPhamNavigation?.TenSanPham ?? "",
                HinhAnh = c.MaSanPhamNavigation?.HinhAnhSanPhams
                    .Where(h => h.LaAnhChinh)
                    .Select(h => h.DuongDan)
                    .FirstOrDefault(),
                SoLuong = c.SoLuong,
                DonGia = c.DonGia,
                ThanhTien = c.ThanhTien ?? 0,
            }).ToList(),
        };

        if (delivery is not null)
        {
            response.GiaoHang = new OrderDeliveryDto
            {
                MaGiaoHang = delivery.MaGiaoHang,
                DiaChiGiao = delivery.DiaChiGiao,
                NguoiNhan = delivery.NguoiNhan,
                SDTNguoiNhan = delivery.SdtnguoiNhan,
                TrangThai = delivery.TrangThai,
                PhiGiaoHang = delivery.PhiGiaoHang,
                GhiChu = delivery.GhiChu,
                NgayGiao = delivery.NgayGiao,
                MaShipper = delivery.MaShipper,
                TenShipper = delivery.MaShipperNavigation?.HoTen,
            };
        }

        return ServiceResult<AdminOrderDetailResponse>.Ok(response);
    }

    public async Task<ServiceResult> CancelByTrackingTokenAsync(string token, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token))
            return ServiceResult.Fail("Mã theo dõi không hợp lệ.");

        var order = await _context.DonHangs
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.TrackingToken == token, ct);

        if (order is null)
            return ServiceResult.Fail("Không tìm thấy đơn hàng hoặc link theo dõi không hợp lệ.");

        if (!CustomerCancellableStatuses.Contains(order.TrangThai))
            return ServiceResult.Fail("Đơn hàng không thể hủy ở trạng thái hiện tại. Vui lòng liên hệ cửa hàng.");

        return await UpdateStatusAsync(order.MaDonHang, new UpdateOrderStatusRequest { TrangThai = "DaHuy" }, ct);
    }

    public async Task<ServiceResult> CancelMyOrderAsync(int maDonHang, int maNguoiDung, CancellationToken ct = default)
    {
        var maKhachHang = await _context.KhachHangs
            .AsNoTracking()
            .Where(k => k.MaNguoiDung == maNguoiDung)
            .Select(k => (int?)k.MaKhachHang)
            .FirstOrDefaultAsync(ct);

        var order = await _context.DonHangs
            .AsNoTracking()
            .FirstOrDefaultAsync(d =>
                d.MaDonHang == maDonHang &&
                (d.MaNguoiTao == maNguoiDung || (maKhachHang != null && d.MaKhachHang == maKhachHang)), ct);

        if (order is null)
            return ServiceResult.Fail("Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn này.");

        if (!CustomerCancellableStatuses.Contains(order.TrangThai))
            return ServiceResult.Fail("Đơn hàng không thể hủy ở trạng thái hiện tại. Vui lòng liên hệ cửa hàng.");

        return await UpdateStatusAsync(maDonHang, new UpdateOrderStatusRequest { TrangThai = "DaHuy" }, ct);
    }

    public async Task<ServiceResult<List<ShipperListItemDto>>> GetInternalShippersAsync(CancellationToken ct = default)
    {
        var shippers = await _context.NguoiDungs
            .Include(u => u.MaVaiTroNavigation)
            .AsNoTracking()
            .Where(u => u.TrangThai && ShipperRoles.Contains(u.MaVaiTroNavigation.TenVaiTro))
            .OrderBy(u => u.HoTen)
            .Select(u => new ShipperListItemDto
            {
                MaNguoiDung = u.MaNguoiDung,
                HoTen = u.HoTen,
                SoDienThoai = u.SoDienThoai,
                TenVaiTro = u.MaVaiTroNavigation.TenVaiTro,
            })
            .ToListAsync(ct);

        return ServiceResult<List<ShipperListItemDto>>.Ok(shippers);
    }

    public async Task<ServiceResult> UpdateStatusAsync(
        int maDonHang, UpdateOrderStatusRequest request, CancellationToken ct = default)
    {
        var trangThai = request.TrangThai?.Trim();
        if (string.IsNullOrWhiteSpace(trangThai))
            return ServiceResult.Fail("Trạng thái không hợp lệ.");

        var order = await _context.DonHangs
            .Include(d => d.HoaDon).ThenInclude(h => h!.ThanhToans)
            .Include(d => d.GiaoHangs)
            .Include(d => d.MaKhachHangNavigation)
            .FirstOrDefaultAsync(d => d.MaDonHang == maDonHang, ct);

        if (order is null)
            return ServiceResult.Fail("Không tìm thấy đơn hàng.");

        var validTransitions = new Dictionary<string, string[]>
        {
            ["ChoThanhToan"] = ["ChoBep", "DaHuy"],
            ["ChoBep"] = ["DangChuanBi", "DaHuy"],
            ["DangChuanBi"] = ["ChoGiaoHang"],
            ["ChoGiaoHang"] = ["DangGiao", "HoanThanh"],
            ["DangGiao"] = ["HoanThanh"],
        };

        if (!validTransitions.TryGetValue(order.TrangThai, out var allowed) || !allowed.Contains(trangThai))
            return ServiceResult.Fail($"Không thể chuyển từ '{order.TrangThai}' sang '{trangThai}'.");

        var now = DateTime.Now;
        var delivery = order.GiaoHangs.OrderByDescending(g => g.NgayTao).FirstOrDefault();

        if (delivery is null && trangThai is "ChoGiaoHang" or "DangGiao")
            delivery = await EnsureDeliveryRecordAsync(order, now, ct);

        if (trangThai is "ChoGiaoHang" or "DangGiao" && delivery is null)
            return ServiceResult.Fail("Đơn thiếu thông tin giao hàng. Vui lòng cập nhật địa chỉ khách hàng.");

        if (trangThai == "ChoBep" && order.TrangThai == "ChoThanhToan")
        {
            ConfirmOnlinePayment(order, now);
            await using var tx = await _context.Database.BeginTransactionAsync(ct);
            try
            {
                var deductResult = await _orderInventoryService.DeductForOrderAsync(maDonHang, null, ct);
                if (!deductResult.Success)
                {
                    await tx.RollbackAsync(ct);
                    return deductResult;
                }
                await tx.CommitAsync(ct);
            }
            catch
            {
                await tx.RollbackAsync(ct);
                throw;
            }
        }

        if (trangThai == "DangGiao")
        {
            if (!request.MaShipper.HasValue)
                return ServiceResult.Fail("Vui lòng chọn shipper nội bộ trước khi giao hàng.");

            var shipperExists = await _context.NguoiDungs
                .Include(u => u.MaVaiTroNavigation)
                .AnyAsync(u =>
                    u.MaNguoiDung == request.MaShipper.Value &&
                    u.TrangThai &&
                    ShipperRoles.Contains(u.MaVaiTroNavigation.TenVaiTro), ct);

            if (!shipperExists)
                return ServiceResult.Fail("Shipper không hợp lệ hoặc không thuộc nhân sự nội bộ.");

            delivery!.MaShipper = request.MaShipper!.Value;
            delivery.TrangThai = "DangGiao";

            if (!string.IsNullOrWhiteSpace(request.GhiChuGiao))
                delivery.GhiChu = request.GhiChuGiao.Trim();

            if (delivery.PhiGiaoHang <= 0)
            {
                var phiGiao = request.PhiGiaoHang ?? 0;
                if (phiGiao < 0)
                    return ServiceResult.Fail("Phí giao hàng không hợp lệ.");

                delivery.PhiGiaoHang = phiGiao;
                order.TongThanhToan = order.TongTamTinh - order.SoTienGiam + phiGiao;
                if (order.HoaDon is not null)
                {
                    order.HoaDon.TongThanhToan = order.TongThanhToan;
                    var codPayment = order.HoaDon.ThanhToans
                        .FirstOrDefault(t => t.PhuongThucThanhToan == "COD");
                    if (codPayment is not null)
                        codPayment.SoTien = order.TongThanhToan;
                }
            }
        }

        if (trangThai == "HoanThanh")
        {
            if (delivery is not null)
            {
                delivery.TrangThai = "DaGiao";
                delivery.NgayGiao ??= now;
            }

            CompleteCodPayment(order, now);
        }

        if (trangThai == "DaHuy" && delivery is not null)
            delivery.TrangThai = "DaHuy";

        if (trangThai == "DaHuy")
        {
            // Nếu đã ở trạng thái chờ hoàn tiền thì không xử lý lại
            if (order.TrangThaiHuy == "ChoHoanTien")
            {
                // Đã được set, không cần xử lý thêm
            }
            else
            {
                var restoreResult = await _orderInventoryService.RestoreForOrderAsync(maDonHang, null, ct);
                if (!restoreResult.Success)
                    return restoreResult;

                // VNPay: không phải COD → chờ xác nhận hoàn tiền
                // Bao gồm: COD = không cần hoàn, VNPay = cần hoàn
                var isCod = order.HoaDon != null && order.HoaDon.TrangThai == "COD";
                var coVnpayThanhCong = order.HoaDon != null && 
                    order.HoaDon.ThanhToans.Any(t => t.PhuongThucThanhToan == "VNPAY" && t.TrangThai == "ThanhCong");

                // Nếu là VNPay (không phải COD) → cần hoàn tiền
                if (!isCod)
                {
                    order.YeuCauHuy = true;
                    order.TrangThaiHuy = "ChoHoanTien";
                    order.LyDoHuy = "Admin hủy đơn";
                    order.NgayYeuCauHuy = now;
                }
            }
        }

        if (trangThai == "ChoGiaoHang" && delivery is not null)
            delivery.TrangThai = "ChoGiao";

        order.TrangThai = trangThai;
        await _context.SaveChangesAsync(ct);

        if (trangThai == "HoanThanh")
        {
            try
            {
                await _invoiceEmailService.SendInvoiceAsync(order.MaDonHang, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gửi hóa đơn email thất bại cho đơn #{OrderId}", order.MaDonHang);
            }
        }

        return ServiceResult.Ok($"Đã cập nhật đơn hàng #{maDonHang} thành '{trangThai}'.");
    }

    public async Task<ServiceResult<CancelOrderResponse>> RequestCancelAsync(
        int maDonHang, int maNguoiDung, CancelOrderRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.LyDoHuy))
            return ServiceResult<CancelOrderResponse>.Fail("Vui lòng nhập lý do hủy.");

        var maKhachHang = await _context.KhachHangs
            .AsNoTracking()
            .Where(k => k.MaNguoiDung == maNguoiDung)
            .Select(k => (int?)k.MaKhachHang)
            .FirstOrDefaultAsync(ct);

        var order = await _context.DonHangs
            .FirstOrDefaultAsync(d =>
                d.MaDonHang == maDonHang &&
                (d.MaNguoiTao == maNguoiDung || (maKhachHang != null && d.MaKhachHang == maKhachHang)), ct);

        if (order is null)
            return ServiceResult<CancelOrderResponse>.Fail("Không tìm thấy đơn hàng.");

        if (!CustomerCancellableStatuses.Contains(order.TrangThai))
            return ServiceResult<CancelOrderResponse>.Fail("Đơn hàng không thể hủy ở trạng thái hiện tại.");

        order.YeuCauHuy = true;
        order.LyDoHuy = request.LyDoHuy.Trim();
        order.NgayYeuCauHuy = DateTime.Now;
        order.TrangThaiHuy = "ChoHoanTien";

        await _context.SaveChangesAsync(ct);

        return ServiceResult<CancelOrderResponse>.Ok(new CancelOrderResponse
        {
            ZaloSoDienThoai = "0769472076",
            EmailHoTro = "support@flygo.vn",
            ThongBao = "Yêu cầu hủy đã được ghi nhận. Vui lòng liên hệ Zalo 0769472076 để được hoàn tiền trong 24-48h.",
        });
    }

    public async Task<ServiceResult> ProcessRefundAsync(
        int maDonHang, ProcessRefundRequest request, int maNguoiDung, CancellationToken ct = default)
    {
        var order = await _context.DonHangs
            .Include(d => d.HoaDon)
            .FirstOrDefaultAsync(d => d.MaDonHang == maDonHang, ct);

        if (order is null)
            return ServiceResult.Fail("Không tìm thấy đơn hàng.");

        if (order.YeuCauHuy != true || order.TrangThaiHuy != "ChoHoanTien")
            return ServiceResult.Fail("Đơn hàng không có yêu cầu hủy hoặc đã được xử lý.");

        var nguoiDung = await _context.NguoiDungs
            .AsNoTracking()
            .Where(u => u.MaNguoiDung == maNguoiDung)
            .Select(u => u.HoTen)
            .FirstOrDefaultAsync(ct);

        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            order.TrangThaiHuy = "DaHoanTien";
            order.SoTienHoan = request.SoTienHoan;
            order.MaGiaoDichHoan = request.MaGiaoDichHoan;
            order.NguoiXuLyHoan = !string.IsNullOrWhiteSpace(request.NguoiXuLyHoan)
                ? request.NguoiXuLyHoan
                : nguoiDung;
            order.NgayHoanTien = DateTime.Now;
            order.TrangThai = "DaHuy";

            var lichSuHoanTien = new LichSuHoanTien
            {
                MaDonHang = maDonHang,
                MaNguoiXuLy = maNguoiDung,
                HoTenNguoiXuLy = !string.IsNullOrWhiteSpace(request.NguoiXuLyHoan)
                    ? request.NguoiXuLyHoan
                    : nguoiDung,
                SoTienHoan = request.SoTienHoan,
                MaGiaoDichHoan = request.MaGiaoDichHoan,
                GhiChu = request.GhiChu,
                NgayXuLy = DateTime.Now,
            };
            _context.LichSuHoanTiens.Add(lichSuHoanTien);

            if (order.HoaDon is not null)
                order.HoaDon.TrangThai = "DaHuy";

            var restoreResult = await _orderInventoryService.RestoreForOrderAsync(maDonHang, maNguoiDung, ct);
            if (!restoreResult.Success)
            {
                await tx.RollbackAsync(ct);
                return restoreResult;
            }

            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }

        return ServiceResult.Ok($"Đã xử lý hoàn tiền cho đơn #{maDonHang}.");
    }

    public async Task<ServiceResult<List<RefundHistoryDto>>> GetRefundHistoryAsync(int maDonHang, CancellationToken ct = default)
    {
        var history = await _context.LichSuHoanTiens
            .AsNoTracking()
            .Where(h => h.MaDonHang == maDonHang)
            .OrderByDescending(h => h.NgayXuLy)
            .Select(h => new RefundHistoryDto
            {
                MaLichSu = h.MaLichSu,
                MaDonHang = h.MaDonHang,
                HoTenNguoiXuLy = h.HoTenNguoiXuLy ?? h.MaNguoiXuLyNavigation.HoTen,
                SoTienHoan = h.SoTienHoan,
                MaGiaoDichHoan = h.MaGiaoDichHoan,
                GhiChu = h.GhiChu,
                NgayXuLy = h.NgayXuLy,
            })
            .ToListAsync(ct);

        return ServiceResult<List<RefundHistoryDto>>.Ok(history);
    }

    public async Task<ServiceResult<AdminOrderDetailResponse>> UpdateCustomerInfoAsync(
        int maDonHang, UpdateCustomerInfoRequest request, CancellationToken ct = default)
    {
        var order = await _context.DonHangs
            .Include(d => d.ChiTietDonHangs).ThenInclude(c => c.MaSanPhamNavigation).ThenInclude(s => s.HinhAnhSanPhams)
            .Include(d => d.MaKhachHangNavigation)
            .Include(d => d.GiaoHangs).ThenInclude(g => g.MaShipperNavigation)
            .Include(d => d.HoaDon)
            .FirstOrDefaultAsync(d => d.MaDonHang == maDonHang, ct);

        if (order is null)
            return ServiceResult<AdminOrderDetailResponse>.Fail("Không tìm thấy đơn hàng.");

        order.SoDienThoai = request.SoDienThoai.Trim();
        order.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();

        await _context.SaveChangesAsync(ct);

        var delivery = order.GiaoHangs.OrderByDescending(g => g.NgayTao).FirstOrDefault();
        var paymentMethod = order.HoaDon?.TrangThai == "COD" ? "COD" : "VNPAY";

        var response = new AdminOrderDetailResponse
        {
            MaDonHang = order.MaDonHang,
            TenKhachHang = order.MaKhachHangNavigation?.HoTen,
            SoDienThoai = order.SoDienThoai,
            Email = order.Email,
            LoaiDonHang = order.LoaiDonHang,
            TrangThai = order.TrangThai,
            TongTamTinh = order.TongTamTinh,
            SoTienGiam = order.SoTienGiam,
            TongThanhToan = order.TongThanhToan,
            GhiChu = order.GhiChu,
            NgayTao = order.NgayTao,
            SoHoaDon = order.HoaDon?.SoHoaDon,
            TrangThaiThanhToan = order.HoaDon?.TrangThai,
            PhuongThucThanhToan = paymentMethod,
            Items = order.ChiTietDonHangs.Select(c => new OrderDetailItemDto
            {
                MaSanPham = c.MaSanPham,
                TenSanPham = c.MaSanPhamNavigation?.TenSanPham ?? "",
                HinhAnh = c.MaSanPhamNavigation?.HinhAnhSanPhams
                    .Where(h => h.LaAnhChinh)
                    .Select(h => h.DuongDan)
                    .FirstOrDefault(),
                SoLuong = c.SoLuong,
                DonGia = c.DonGia,
                ThanhTien = c.ThanhTien ?? 0,
            }).ToList(),
            YeuCauHuy = order.YeuCauHuy,
            TrangThaiHuy = order.TrangThaiHuy,
            LyDoHuy = order.LyDoHuy,
            NgayYeuCauHuy = order.NgayYeuCauHuy,
            SoTienHoan = order.SoTienHoan,
            NgayHoanTien = order.NgayHoanTien,
            MaGiaoDichHoan = order.MaGiaoDichHoan,
            NguoiXuLyHoan = order.NguoiXuLyHoan,
        };

        if (delivery is not null)
        {
            response.GiaoHang = new OrderDeliveryDto
            {
                MaGiaoHang = delivery.MaGiaoHang,
                DiaChiGiao = delivery.DiaChiGiao,
                NguoiNhan = delivery.NguoiNhan,
                SDTNguoiNhan = delivery.SdtnguoiNhan,
                TrangThai = delivery.TrangThai,
                PhiGiaoHang = delivery.PhiGiaoHang,
                GhiChu = delivery.GhiChu,
                NgayGiao = delivery.NgayGiao,
                MaShipper = delivery.MaShipper,
                TenShipper = delivery.MaShipperNavigation?.HoTen,
            };
        }

        return ServiceResult<AdminOrderDetailResponse>.Ok(response);
    }

    public async Task<ServiceResult> DeleteManyAsync(IReadOnlyList<int> ids, CancellationToken ct = default)
    {
        if (ids is null || ids.Count == 0)
            return ServiceResult.Fail("Chưa chọn đơn hàng nào.");

        var distinctIds = ids.Distinct().ToList();
        var orders = await _context.DonHangs
            .Include(d => d.ChiTietDonHangs)
            .Include(d => d.GiaoHangs)
            .Include(d => d.HoaDon).ThenInclude(h => h!.ThanhToans)
            .Where(d => distinctIds.Contains(d.MaDonHang))
            .ToListAsync(ct);

        if (orders.Count == 0)
            return ServiceResult.Fail("Không tìm thấy đơn hàng cần xóa.");

        foreach (var order in orders)
        {
            if (order.HoaDon is not null)
            {
                _context.ThanhToans.RemoveRange(order.HoaDon.ThanhToans);
                _context.HoaDons.Remove(order.HoaDon);
            }

            _context.GiaoHangs.RemoveRange(order.GiaoHangs);
            _context.ChiTietDonHangs.RemoveRange(order.ChiTietDonHangs);
            _context.DonHangs.Remove(order);
        }

        await _context.SaveChangesAsync(ct);
        return ServiceResult.Ok($"Đã xóa {orders.Count} đơn hàng.");
    }

    private void ConfirmOnlinePayment(DonHang order, DateTime now)
    {
        if (order.HoaDon is null)
        {
            _logger.LogWarning("ConfirmOnlinePayment: DonHang #{OrderId} không có HoaDon", order.MaDonHang);
            return;
        }

        if (order.HoaDon.TrangThai == "COD")
            return;

        order.HoaDon.TrangThai = "DaThanhToan";

        var hasPayment = order.HoaDon.ThanhToans.Any(t =>
            t.PhuongThucThanhToan == "VNPAY" && t.TrangThai == "ThanhCong");

        if (!hasPayment)
        {
            _context.ThanhToans.Add(new ThanhToan
            {
                MaHoaDon = order.HoaDon.MaHoaDon,
                PhuongThucThanhToan = "VNPAY",
                SoTien = order.HoaDon.TongThanhToan,
                TrangThai = "ThanhCong",
                ThoiGianThanhToan = now,
                GhiChu = "Admin xac nhan thanh toan online",
            });
        }
    }

    private void CompleteCodPayment(DonHang order, DateTime now)
    {
        if (order.HoaDon is null || order.HoaDon.TrangThai != "COD")
            return;

        var codPayment = order.HoaDon.ThanhToans
            .FirstOrDefault(t => t.PhuongThucThanhToan == "COD");

        if (codPayment is not null && codPayment.TrangThai != "ThanhCong")
        {
            codPayment.TrangThai = "ThanhCong";
            codPayment.ThoiGianThanhToan = now;
            codPayment.GhiChu = "Shipper da thu tien COD";
        }

        order.HoaDon.TrangThai = "DaThanhToan";
    }

    private async Task<GiaoHang> EnsureDeliveryRecordAsync(DonHang order, DateTime now, CancellationToken ct)
    {
        var existing = order.GiaoHangs.OrderByDescending(g => g.NgayTao).FirstOrDefault();
        if (existing is not null)
            return existing;

        ParseOrderNote(order.GhiChu, out var noteName, out var notePhone, out var noteAddress);

        var customer = order.MaKhachHangNavigation;
        var delivery = new GiaoHang
        {
            MaDonHang = order.MaDonHang,
            DiaChiGiao = noteAddress ?? customer?.DiaChi ?? "Chưa cập nhật địa chỉ",
            NguoiNhan = noteName ?? customer?.HoTen ?? "Khách hàng",
            SdtnguoiNhan = notePhone ?? customer?.SoDienThoai ?? "0000000000",
            TrangThai = order.TrangThai == "ChoGiaoHang" ? "ChoGiao" : "ChoLayHang",
            PhiGiaoHang = 0,
            NgayTao = now,
        };

        order.LoaiDonHang = "GiaoTanNoi";
        _context.GiaoHangs.Add(delivery);
        order.GiaoHangs.Add(delivery);
        await _context.SaveChangesAsync(ct);

        return delivery;
    }

    private static void ParseOrderNote(string? ghiChu, out string? hoTen, out string? soDienThoai, out string? diaChi)
    {
        hoTen = soDienThoai = diaChi = null;
        if (string.IsNullOrWhiteSpace(ghiChu))
            return;

        foreach (var part in ghiChu.Split('|', StringSplitOptions.TrimEntries))
        {
            if (part.StartsWith("KH:", StringComparison.OrdinalIgnoreCase))
                hoTen = part[3..].Trim();
            else if (part.StartsWith("SDT:", StringComparison.OrdinalIgnoreCase))
                soDienThoai = part[4..].Trim();
            else if (part.StartsWith("DC:", StringComparison.OrdinalIgnoreCase))
                diaChi = part[3..].Trim();
        }
    }

    private static string? BuildOrderNote(CreateOrderRequest request)
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.HoTen)) parts.Add($"KH: {request.HoTen.Trim()}");
        if (!string.IsNullOrWhiteSpace(request.SoDienThoai)) parts.Add($"SDT: {request.SoDienThoai.Trim()}");
        if (!string.IsNullOrWhiteSpace(request.Email)) parts.Add($"EMAIL: {request.Email.Trim()}");
        if (!string.IsNullOrWhiteSpace(request.MaCode)) parts.Add($"VOUCHER: {request.MaCode.Trim().ToUpperInvariant()}");
        if (!string.IsNullOrWhiteSpace(request.DiaChi)) parts.Add($"DC: {request.DiaChi.Trim()}");
        if (!string.IsNullOrWhiteSpace(request.GhiChu)) parts.Add(request.GhiChu.Trim());
        return parts.Count > 0 ? string.Join(" | ", parts) : null;
    }
}
