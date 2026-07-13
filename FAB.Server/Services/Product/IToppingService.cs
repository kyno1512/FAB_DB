using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Product;

public interface IToppingService
{
    Task<ServiceResult<List<ToppingResponse>>> GetAllAsync(bool? activeOnly = null, CancellationToken ct = default);
}
