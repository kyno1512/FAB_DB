using FAB.Server.Common;
using FAB.Server.Models.DTOs;

namespace FAB.Server.Services.Auth;

// Kiểm tra dữ liệu đầu vào — trả về null nếu hợp lệ, trả về message lỗi nếu không
internal static class AuthRules
{
    public static string? ValidateLogin(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return "Vui lòng nhập email và mật khẩu.";

        return null;
    }

    public static string? ValidateRegister(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.HoTen) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.ConfirmPassword) ||
            string.IsNullOrWhiteSpace(request.SoDienThoai))
            return "Vui lòng nhập đầy đủ thông tin bắt buộc.";

        if (!request.Email.Contains('@'))
            return "Email không hợp lệ.";

        return ValidatePasswordPair(request.Password, request.ConfirmPassword);
    }

    public static string? ValidateForgotPassword(ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return "Vui lòng nhập email.";

        return null;
    }

    public static string? ValidateUpdateProfile(UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.HoTen) || string.IsNullOrWhiteSpace(request.SoDienThoai))
            return "Vui lòng nhập họ tên và số điện thoại.";

        if (!string.IsNullOrWhiteSpace(request.NgaySinh) &&
            !DateOnly.TryParse(request.NgaySinh, out _))
            return "Ngày sinh không hợp lệ (định dạng yyyy-MM-dd).";

        return null;
    }

    public static string? ValidateChangePassword(ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
            string.IsNullOrWhiteSpace(request.NewPassword) ||
            string.IsNullOrWhiteSpace(request.ConfirmPassword))
            return "Vui lòng nhập đầy đủ thông tin.";

        if (request.CurrentPassword.Trim() == request.NewPassword.Trim())
            return "Mật khẩu mới phải khác mật khẩu hiện tại.";

        return ValidatePasswordPair(request.NewPassword, request.ConfirmPassword);
    }

    public static string? ValidateAdminResetPassword(AdminResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) ||
            string.IsNullOrWhiteSpace(request.ConfirmPassword))
            return "Vui lòng nhập đầy đủ thông tin.";

        return ValidatePasswordPair(request.NewPassword, request.ConfirmPassword);
    }

    public static string? ValidateResetPassword(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Token) ||
            string.IsNullOrWhiteSpace(request.NewPassword) ||
            string.IsNullOrWhiteSpace(request.ConfirmPassword))
            return "Vui lòng nhập đầy đủ thông tin.";

        var otp = request.Token.Trim();
        if (otp.Length != AuthConstants.OtpLength || !otp.All(char.IsDigit))
            return $"Mã OTP phải gồm {AuthConstants.OtpLength} chữ số.";

        return ValidatePasswordPair(request.NewPassword, request.ConfirmPassword);
    }

    private static string? ValidatePasswordPair(string password, string confirmPassword)
    {
        var pwd = password.Trim();
        var confirm = confirmPassword.Trim();

        if (pwd != confirm)
            return "Mật khẩu xác nhận không khớp.";

        if (pwd.Length < AuthConstants.MinPasswordLength)
            return $"Mật khẩu phải có ít nhất {AuthConstants.MinPasswordLength} ký tự.";

        return null;
    }
}
