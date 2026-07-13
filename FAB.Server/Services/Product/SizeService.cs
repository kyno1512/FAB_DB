using FAB.Server.Models;
using FAB.Server.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FAB.Server.Services.Product;

public class SizeService : ISizeService
{
    private readonly Context.FabDbContext _context;

    public SizeService(Context.FabDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SizeResponse>> GetAllSizesAsync(CancellationToken ct = default)
    {
        return await _context.Sizes
            .AsNoTracking()
            .OrderBy(s => s.ThuTu)
            .Select(s => new SizeResponse
            {
                MaSize = s.MaSize,
                TenSize = s.TenSize,
                HeSoGia = s.HeSoGia,
                ThuTu = s.ThuTu
            })
            .ToListAsync(ct);
    }

    public async Task<SizeResponse> CreateSizeAsync(string tenSize, decimal heSoGia, int thuTu, CancellationToken ct = default)
    {
        var maxMa = await _context.Sizes.MaxAsync(s => (int?)s.MaSize, ct) ?? 0;
        var size = new Size
        {
            MaSize = maxMa + 1,
            TenSize = tenSize,
            HeSoGia = heSoGia,
            ThuTu = thuTu,
            TrangThai = true
        };
        _context.Sizes.Add(size);
        await _context.SaveChangesAsync(ct);

        return new SizeResponse
        {
            MaSize = size.MaSize,
            TenSize = size.TenSize,
            HeSoGia = size.HeSoGia,
            ThuTu = size.ThuTu
        };
    }

    public async Task<SizeResponse> UpdateSizeAsync(int id, string tenSize, decimal heSoGia, int thuTu, bool trangThai, CancellationToken ct = default)
    {
        var size = await _context.Sizes.FindAsync(new object[] { id }, ct)
            ?? throw new Exception("Không tìm thấy size");

        size.TenSize = tenSize;
        size.HeSoGia = heSoGia;
        size.ThuTu = thuTu;
        size.TrangThai = trangThai;
        await _context.SaveChangesAsync(ct);

        return new SizeResponse
        {
            MaSize = size.MaSize,
            TenSize = size.TenSize,
            HeSoGia = size.HeSoGia,
            ThuTu = size.ThuTu
        };
    }

    public async Task DeleteSizeAsync(int id, CancellationToken ct = default)
    {
        var size = await _context.Sizes.FindAsync(new object[] { id }, ct)
            ?? throw new Exception("Không tìm thấy size");

        _context.Sizes.Remove(size);
        await _context.SaveChangesAsync(ct);
    }
}
