using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Admin;

public interface IReportsAdminService
{
    Task<ServiceResult<ReportsOverviewDto>> GetOverviewAsync(
        DateTime? from,
        DateTime? to,
        string? groupBy,
        CancellationToken ct = default);
}
