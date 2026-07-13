using FAB.Server.Common;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Product;

public class ProductReviewService : IProductReviewService
{
    private readonly FabDbContext _context;

    public ProductReviewService(FabDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<ProductReviewPageDto>> GetByProductAsync(
        int maSanPham, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var productExists = await _context.SanPhams
            .AsNoTracking()
            .AnyAsync(x => x.MaSanPham == maSanPham && x.TrangThai, ct);

        if (!productExists)
            return ServiceResult<ProductReviewPageDto>.Fail("Sản phẩm không tồn tại.");

        var query = _context.DanhGiaSanPhams
            .AsNoTracking()
            .Where(x => x.MaSanPham == maSanPham && x.TrangThai);

        var totalCount = await query.CountAsync(ct);
        var average = totalCount == 0
            ? 0
            : await query.AverageAsync(x => (double)x.Diem, ct);

        var items = await query
            .OrderByDescending(x => x.NgayTao)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductReviewItemDto
            {
                MaDanhGia = x.MaDanhGia,
                HoTen = x.MaNguoiDung != null
                    ? x.MaNguoiDungNavigation!.HoTen
                    : ProductReviewConstants.GuestDisplayName,
                Diem = x.Diem,
                NoiDung = x.NoiDung,
                NgayTao = x.NgayTao,
            })
            .ToListAsync(ct);

        return ServiceResult<ProductReviewPageDto>.Ok(new ProductReviewPageDto
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            DiemTrungBinh = Math.Round(average, 1),
            TongDanhGia = totalCount,
        });
    }

    public async Task<ServiceResult<ProductReviewItemDto>> CreateAsync(
        int maSanPham, int? maNguoiDung, CreateProductReviewRequest request, CancellationToken ct = default)
    {
        if (request.Diem is < 1 or > 5)
            return ServiceResult<ProductReviewItemDto>.Fail("Điểm đánh giá phải từ 1 đến 5 sao.");

        var content = request.NoiDung?.Trim() ?? string.Empty;
        if (content.Length < 5)
            return ServiceResult<ProductReviewItemDto>.Fail("Bình luận phải có ít nhất 5 ký tự.");

        var productExists = await _context.SanPhams
            .AnyAsync(x => x.MaSanPham == maSanPham && x.TrangThai, ct);

        if (!productExists)
            return ServiceResult<ProductReviewItemDto>.Fail("Sản phẩm không tồn tại.");

        string displayName;

        if (maNguoiDung is int userId)
        {
            var user = await _context.NguoiDungs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaNguoiDung == userId && x.TrangThai, ct);

            if (user is null)
                return ServiceResult<ProductReviewItemDto>.Fail("Tài khoản không hợp lệ.");

            var exists = await _context.DanhGiaSanPhams
                .AnyAsync(x => x.MaSanPham == maSanPham && x.MaNguoiDung == userId, ct);

            if (exists)
                return ServiceResult<ProductReviewItemDto>.Fail("Bạn đã đánh giá sản phẩm này rồi.");

            displayName = user.HoTen;
        }
        else
        {
            displayName = ProductReviewConstants.GuestDisplayName;
            maNguoiDung = null;
        }

        var review = new DanhGiaSanPham
        {
            MaSanPham = maSanPham,
            MaNguoiDung = maNguoiDung,
            HoTenKhach = maNguoiDung is null ? displayName : null,
            Diem = (byte)request.Diem,
            NoiDung = content,
            TrangThai = true,
            NgayTao = DateTime.Now,
        };

        _context.DanhGiaSanPhams.Add(review);
        await _context.SaveChangesAsync(ct);

        return ServiceResult<ProductReviewItemDto>.Ok(new ProductReviewItemDto
        {
            MaDanhGia = review.MaDanhGia,
            HoTen = displayName,
            Diem = review.Diem,
            NoiDung = review.NoiDung,
            NgayTao = review.NgayTao,
        });
    }
}
