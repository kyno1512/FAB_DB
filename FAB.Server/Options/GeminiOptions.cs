namespace FAB.Server.Options;

/// <summary>
/// Cấu hình Google Gemini (free tier qua AI Studio).
/// ApiKey để trống trong appsettings.json, điền trong User Secrets.
/// </summary>
public class GeminiOptions
{
    public const string SectionName = "Gemini";

    public string ApiKey { get; set; } = string.Empty;

    public string Model { get; set; } = "gemini-2.0-flash-lite";
}
