namespace FAB.Server.Services.Email;

public interface IEmailService
{
    bool IsConfigured { get; }

    Task SendAsync(string to, string subject, string body, bool isHtml = false, CancellationToken cancellationToken = default);
}
