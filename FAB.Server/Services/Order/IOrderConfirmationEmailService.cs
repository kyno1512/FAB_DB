using System.Threading;
using System.Threading.Tasks;

namespace FAB.Server.Services.Order;

public interface IOrderConfirmationEmailService
{
    Task<bool> SendConfirmationAsync(int maDonHang, CancellationToken ct = default);
}
