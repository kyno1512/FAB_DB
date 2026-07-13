using System.Net.Http.Json;
using System.Text.Json;
using FAB.Server.Common;
using FAB.Server.Options;
using Google.GenAI;
using Google.GenAI.Types;
using Microsoft.Extensions.Options;

namespace FAB.Server.Services.Chat;

public class GeminiService : IGeminiService
{
    private readonly GeminiOptions _options;
    private readonly HttpClient _http;

    public GeminiService(IOptions<GeminiOptions> options, HttpClient http)
    {
        _options = options.Value;
        _http = http;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_options.ApiKey);

    public string Model => _options.Model;

    private bool IsExpressKey => _options.ApiKey.Trim().StartsWith("AQ.", StringComparison.Ordinal);

    public async Task<ServiceResult<string>> GenerateReplyAsync(
        string systemPrompt,
        string userMessage,
        CancellationToken ct = default)
    {
        if (!IsConfigured)
        {
            return ServiceResult<string>.Fail(
                "Chưa cấu hình Gemini. Lấy API key tại https://aistudio.google.com/apikey");
        }

        // Ưu tiên model free tier; gemini-2.0-flash hay bị quota limit = 0
        var models = new[]
        {
            string.IsNullOrWhiteSpace(_options.Model) ? "gemini-2.0-flash-lite" : _options.Model,
            "gemini-2.0-flash-lite",
            "gemini-2.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-flash",
            "gemini-2.0-flash",
        }.Distinct(StringComparer.OrdinalIgnoreCase);

        string? lastError = null;
        foreach (var model in models)
        {
            var sdk = await TrySdkAsync(systemPrompt, userMessage, model, ct);
            if (sdk.Success && sdk.Data is not null)
                return sdk;
            lastError = sdk.Error;

            var rest = await TryRestAsync(systemPrompt, userMessage, model, ct);
            if (rest.Success && rest.Data is not null)
                return rest;
            lastError = rest.Error ?? lastError;

            if (IsExpressKey)
            {
                var interactions = await TryInteractionsAsync(systemPrompt, userMessage, model, ct);
                if (interactions.Success && interactions.Data is not null)
                    return interactions;
                lastError = interactions.Error ?? lastError;
            }
        }

        return ServiceResult<string>.Fail(lastError ?? "Không kết nối được Gemini.");
    }

    private async Task<ServiceResult<string>> TrySdkAsync(
        string systemPrompt, string userMessage, string model, CancellationToken ct)
    {
        try
        {
            var client = new Client(apiKey: _options.ApiKey.Trim());
            var config = new GenerateContentConfig
            {
                SystemInstruction = new Content
                {
                    Parts = [new Part { Text = systemPrompt }],
                },
            };

            var response = await client.Models.GenerateContentAsync(
                model: model,
                contents: userMessage,
                config: config);

            var text = ExtractText(response?.Candidates?
                .FirstOrDefault()?
                .Content?
                .Parts?
                .FirstOrDefault()?
                .Text);

            return text is not null
                ? ServiceResult<string>.Ok(text)
                : ServiceResult<string>.Fail("Gemini SDK không trả về nội dung.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.Fail(ex.Message);
        }
    }

    private async Task<ServiceResult<string>> TryRestAsync(
        string systemPrompt, string userMessage, string model, CancellationToken ct)
    {
        try
        {
            var apiKey = _options.ApiKey.Trim();
            // Chỉ dùng header x-goog-api-key — không gửi ?key= cùng lúc (AQ. key sẽ lỗi)
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

            var payload = new
            {
                systemInstruction = new { parts = new[] { new { text = systemPrompt } } },
                contents = new[] { new { parts = new[] { new { text = userMessage } } } },
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(payload),
            };
            request.Headers.TryAddWithoutValidation("x-goog-api-key", apiKey);

            using var response = await _http.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
                return ServiceResult<string>.Fail(ParseApiError(body) ?? $"HTTP {(int)response.StatusCode}");

            using var doc = JsonDocument.Parse(body);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            text = ExtractText(text);
            return text is not null
                ? ServiceResult<string>.Ok(text)
                : ServiceResult<string>.Fail("Gemini REST không trả về nội dung.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.Fail(ex.Message);
        }
    }

    private async Task<ServiceResult<string>> TryInteractionsAsync(
        string systemPrompt, string userMessage, string model, CancellationToken ct)
    {
        try
        {
            var apiKey = _options.ApiKey.Trim();
            const string url = "https://generativelanguage.googleapis.com/v1beta/interactions";

            var payload = new
            {
                model,
                input = $"{systemPrompt}\n\nKhách: {userMessage}",
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(payload),
            };
            request.Headers.TryAddWithoutValidation("x-goog-api-key", apiKey);
            request.Headers.TryAddWithoutValidation("Api-Revision", "2026-05-20");

            using var response = await _http.SendAsync(request, ct);
            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
                return ServiceResult<string>.Fail(ParseApiError(body) ?? $"HTTP {(int)response.StatusCode}");

            using var doc = JsonDocument.Parse(body);
            var text = TryReadInteractionText(doc.RootElement);
            text = ExtractText(text);
            return text is not null
                ? ServiceResult<string>.Ok(text)
                : ServiceResult<string>.Fail("Gemini Interactions không trả về nội dung.");
        }
        catch (Exception ex)
        {
            return ServiceResult<string>.Fail(ex.Message);
        }
    }

    private static string? TryReadInteractionText(JsonElement root)
    {
        if (root.TryGetProperty("outputs", out var outputs) && outputs.GetArrayLength() > 0)
        {
            var first = outputs[0];
            if (first.TryGetProperty("text", out var text))
                return text.GetString();
            if (first.TryGetProperty("content", out var content) &&
                content.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0 &&
                parts[0].TryGetProperty("text", out var partText))
                return partText.GetString();
        }

        if (root.TryGetProperty("output", out var output))
        {
            if (output.ValueKind == JsonValueKind.String)
                return output.GetString();
            if (output.TryGetProperty("text", out var outText))
                return outText.GetString();
        }

        return null;
    }

    private static string? ExtractText(string? text) =>
        string.IsNullOrWhiteSpace(text) ? null : text.Trim();

    private static string? ParseApiError(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("error", out var err) &&
                err.TryGetProperty("message", out var msg))
                return msg.GetString();
        }
        catch
        {
            // ignore parse errors
        }

        return null;
    }
}
