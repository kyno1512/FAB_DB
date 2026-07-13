namespace FAB.Server.Common;

public static class AuthConstants
{
    public const string KhachHangRole = "KhachHang";
    public const string AdminPolicyName = "AdminPolicy";
    public const string AdminStaffRolesString = "Admin,QuanLy,NhanVien,Shipper";
    public static readonly string[] AdminStaffRoles = ["Admin", "QuanLy", "NhanVien", "Shipper"];
    public static readonly string[] StaffRoleNames = ["Admin", "QuanLy", "NhanVien", "Shipper"];
    public const int MinPasswordLength = 6;
    public const int OtpLength = 6;
    public const int ResetTokenExpiryMinutes = 15;
    public const string ResetTokenCachePrefix = "reset-password:";
}
