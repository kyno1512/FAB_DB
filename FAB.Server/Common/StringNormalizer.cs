namespace FAB.Server.Common;

public static class StringNormalizer
{
    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    public static string? TrimOrNull(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }
}
