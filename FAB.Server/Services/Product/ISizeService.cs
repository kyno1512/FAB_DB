using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Product;

public interface ISizeService
{
    Task<IReadOnlyList<SizeResponse>> GetAllSizesAsync(CancellationToken ct = default);
    Task<SizeResponse> CreateSizeAsync(string tenSize, decimal heSoGia, int thuTu, CancellationToken ct = default);
    Task<SizeResponse> UpdateSizeAsync(int id, string tenSize, decimal heSoGia, int thuTu, bool trangThai, CancellationToken ct = default);
    Task DeleteSizeAsync(int id, CancellationToken ct = default);
}
