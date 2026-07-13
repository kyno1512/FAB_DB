namespace FAB.Server.Options;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = "FAB-Dev-Jwt-Signing-Key-Change-In-Production-32chars!";
    public string Issuer { get; set; } = "FAB.Server";
    public string Audience { get; set; } = "FAB.Client";
    public int ExpireHours { get; set; } = 12;
}
