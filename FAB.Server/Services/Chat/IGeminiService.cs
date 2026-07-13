using FAB.Server.Common;

namespace FAB.Server.Services.Chat;

public interface IGeminiService
{
    bool IsConfigured { get; }

    string Model { get; }

    Task<ServiceResult<string>> GenerateReplyAsync(string systemPrompt, string userMessage, CancellationToken ct = default);
}
