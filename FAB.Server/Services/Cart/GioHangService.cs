using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FAB.Server.Context;
using FAB.Server.Models;
using FAB.Server.Models.DTOs.Cart;

namespace FAB.Server.Services.Cart;

public class GioHangService : IGioHangService
{
    private readonly FabDbContext _context;

    public GioHangService(FabDbContext context)
    {
        _context = context;
    }

    private async Task<GioHang> GetOrCreateCartAsync(int userId)
    {
        var cart = await _context.GioHangs
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.HinhAnhSanPhams)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.MaDanhMucNavigation)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.GiaSanPhamTheoSizes)
                        .ThenInclude(g => g.MaSizeNavigation)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSizeNavigation)
            .FirstOrDefaultAsync(c => c.MaNguoiDung == userId);

        if (cart == null)
        {
            cart = new GioHang
            {
                MaNguoiDung = userId,
                NgayTao = DateTime.Now,
                NgayCapNhat = DateTime.Now
            };
            _context.GioHangs.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    public async Task<List<CartItemDto>> GetCartAsync(int userId)
    {
        var cart = await _context.GioHangs
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.HinhAnhSanPhams)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.MaDanhMucNavigation)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.GiaSanPhamTheoSizes)
                        .ThenInclude(g => g.MaSizeNavigation)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSizeNavigation)
            .FirstOrDefaultAsync(c => c.MaNguoiDung == userId);

        if (cart == null) return new List<CartItemDto>();

        return cart.ChiTietGioHangs.Select(ci => new CartItemDto
        {
            Id = ci.MaSanPham,
            Name = ci.MaSanPhamNavigation.TenSanPham,
            Price = GetPriceForSize(ci),
            Image = ci.MaSanPhamNavigation.HinhAnhSanPhams.FirstOrDefault()?.DuongDan ?? "",
            Qty = ci.SoLuong,
            SizeId = ci.MaSize,
            SizeName = ci.MaSizeNavigation?.TenSize,
            CategoryName = ci.MaSanPhamNavigation.MaDanhMucNavigation?.TenDanhMuc
        }).ToList();
    }

    private decimal GetPriceForSize(ChiTietGioHang item)
    {
        if (item.MaSize == null)
        {
            return item.MaSanPhamNavigation.GiaBan;
        }

        var sizePrice = item.MaSanPhamNavigation.GiaSanPhamTheoSizes
            .FirstOrDefault(g => g.MaSize == item.MaSize);

        return sizePrice?.Gia ?? item.MaSanPhamNavigation.GiaBan;
    }

    public async Task<List<CartItemDto>> AddToCartAsync(int userId, int productId, int qty, int? sizeId = null)
    {
        var cart = await GetOrCreateCartAsync(userId);
        
        // Find existing item with same product AND same size
        var existingItem = cart.ChiTietGioHangs
            .FirstOrDefault(ci => ci.MaSanPham == productId && ci.MaSize == sizeId);

        if (existingItem != null)
        {
            existingItem.SoLuong += qty;
        }
        else
        {
            cart.ChiTietGioHangs.Add(new ChiTietGioHang
            {
                MaGioHang = cart.MaGioHang,
                MaSanPham = productId,
                MaSize = sizeId,
                SoLuong = qty
            });
        }

        cart.NgayCapNhat = DateTime.Now;
        await _context.SaveChangesAsync();

        return await GetCartAsync(userId);
    }

    public async Task<List<CartItemDto>> UpdateCartItemAsync(int userId, int productId, int qty, int? sizeId = null)
    {
        var cart = await _context.GioHangs
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.HinhAnhSanPhams)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.MaDanhMucNavigation)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.GiaSanPhamTheoSizes)
                        .ThenInclude(g => g.MaSizeNavigation)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSizeNavigation)
            .FirstOrDefaultAsync(c => c.MaNguoiDung == userId);

        if (cart != null)
        {
            var existingItem = cart.ChiTietGioHangs
                .FirstOrDefault(ci => ci.MaSanPham == productId && ci.MaSize == sizeId);

            if (existingItem != null)
            {
                if (qty <= 0)
                {
                    _context.ChiTietGioHangs.Remove(existingItem);
                }
                else
                {
                    existingItem.SoLuong = qty;
                }
                cart.NgayCapNhat = DateTime.Now;
                await _context.SaveChangesAsync();
            }
        }

        return await GetCartAsync(userId);
    }

    public async Task<List<CartItemDto>> RemoveFromCartAsync(int userId, int productId, int? sizeId = null)
    {
        var cart = await _context.GioHangs
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.HinhAnhSanPhams)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.MaDanhMucNavigation)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSanPhamNavigation)
                    .ThenInclude(sp => sp.GiaSanPhamTheoSizes)
                        .ThenInclude(g => g.MaSizeNavigation)
            .Include(c => c.ChiTietGioHangs)
                .ThenInclude(ci => ci.MaSizeNavigation)
            .FirstOrDefaultAsync(c => c.MaNguoiDung == userId);

        if (cart != null)
        {
            var item = cart.ChiTietGioHangs
                .FirstOrDefault(ci => ci.MaSanPham == productId && ci.MaSize == sizeId);
            
            if (item != null)
            {
                _context.ChiTietGioHangs.Remove(item);
                cart.NgayCapNhat = DateTime.Now;
                await _context.SaveChangesAsync();
            }
        }

        return await GetCartAsync(userId);
    }

    public async Task<List<CartItemDto>> SyncCartAsync(int userId, List<CartItemDto> sessionItems)
    {
        if (sessionItems == null || !sessionItems.Any()) return await GetCartAsync(userId);

        var cart = await GetOrCreateCartAsync(userId);

        foreach (var item in sessionItems)
        {
            var existingItem = cart.ChiTietGioHangs
                .FirstOrDefault(ci => ci.MaSanPham == item.Id && ci.MaSize == item.SizeId);
            
            if (existingItem != null)
            {
                existingItem.SoLuong += item.Qty;
            }
            else
            {
                cart.ChiTietGioHangs.Add(new ChiTietGioHang
                {
                    MaGioHang = cart.MaGioHang,
                    MaSanPham = item.Id,
                    MaSize = item.SizeId,
                    SoLuong = item.Qty
                });
            }
        }

        cart.NgayCapNhat = DateTime.Now;
        await _context.SaveChangesAsync();

        return await GetCartAsync(userId);
    }

    public async Task ClearCartAsync(int userId)
    {
        var cart = await _context.GioHangs
            .Include(c => c.ChiTietGioHangs)
            .FirstOrDefaultAsync(c => c.MaNguoiDung == userId);

        if (cart != null)
        {
            _context.ChiTietGioHangs.RemoveRange(cart.ChiTietGioHangs);
            cart.NgayCapNhat = DateTime.Now;
            await _context.SaveChangesAsync();
        }
    }
}
