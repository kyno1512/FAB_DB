using FAB.Server.Common;
using FAB.Server.Models.DTOs;
using FAB.Server.Models;

namespace FAB.Server.Services.Auth;

public interface IAuthService
{
    Task<ServiceResult<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResult<LoginResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    string BuildGoogleAuthUrl(string returnUrl);
    Task<ServiceResult<LoginResponse>> HandleGoogleCallbackAsync(string code, string state, CancellationToken cancellationToken = default);
    Task<ServiceResult<AuthMessageResponse>> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResult> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResult<ProfileResponse>> GetProfileAsync(int maNguoiDung, CancellationToken cancellationToken = default);
    Task<ServiceResult<ProfileResponse>> UpdateProfileAsync(int maNguoiDung, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResult> ChangePasswordAsync(int maNguoiDung, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<NguoiDung?> CheckAccountExistsAsync(string email, CancellationToken cancellationToken = default);
    Task<ServiceResult> ResetPasswordDebugAsync(string email, string newPassword, CancellationToken cancellationToken = default);
}
