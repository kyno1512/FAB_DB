using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Chat;

public interface IChatService
{
    ChatStatusResponse GetStatus();

    Task<ServiceResult<ChatResponse>> SendAsync(ChatRequest request, CancellationToken ct = default);
}
