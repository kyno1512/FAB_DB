using FAB.Server.Models.DTOs;
using FAB.Server.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);

        if (!result.Success)
        {
            return Unauthorized(new { message = result.Error });
        }

        return Ok(result.Data);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Error });
        }

        return Ok(result.Data);
    }

    [HttpGet("google")]
    public IActionResult Google([FromQuery] string returnUrl = "/login")
    {
        var url = _authService.BuildGoogleAuthUrl(returnUrl);
        return Redirect(url);
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback(
        [FromQuery] string code,
        [FromQuery] string state,
        CancellationToken cancellationToken)
    {
        var result = await _authService.HandleGoogleCallbackAsync(code, state, cancellationToken);

        if (!result.Success)
        {
            return Redirect($"http://localhost:5174/login?error={Uri.EscapeDataString(result.Error ?? "Google login failed")}");
        }

        var data = result.Data!;
        var redirect = $"http://localhost:5174/login?token={Uri.EscapeDataString(data.Token)}&maNguoiDung={data.MaNguoiDung}&hoTen={Uri.EscapeDataString(data.HoTen)}&email={Uri.EscapeDataString(data.Email)}&maVaiTro={data.MaVaiTro}&tenVaiTro={Uri.EscapeDataString(data.TenVaiTro)}";
        return Redirect(redirect);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.ForgotPasswordAsync(request, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Error });
        }

        return Ok(result.Data);
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.ResetPasswordAsync(request, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }

    [Authorize]
    [HttpGet("profile/{maNguoiDung:int}")]
    public async Task<IActionResult> GetProfile(int maNguoiDung, CancellationToken cancellationToken)
    {
        var result = await _authService.GetProfileAsync(maNguoiDung, cancellationToken);

        if (!result.Success)
            return NotFound(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize]
    [HttpPut("profile/{maNguoiDung:int}")]
    public async Task<IActionResult> UpdateProfile(
        int maNguoiDung,
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.UpdateProfileAsync(maNguoiDung, request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }

    [Authorize]
    [HttpPut("profile/{maNguoiDung:int}/password")]
    public async Task<IActionResult> ChangePassword(
        int maNguoiDung,
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.ChangePasswordAsync(maNguoiDung, request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "Auth Service is running!" });
    }

    [HttpGet("debug-me")]
    public IActionResult DebugMe()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(r => r.Value).ToList();
        return Ok(new { claims, roles, userIdentity = User.Identity?.IsAuthenticated });
    }

    [HttpGet("check-account/{email}")]
    public async Task<IActionResult> CheckAccount(string email, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _authService.CheckAccountExistsAsync(normalizedEmail, cancellationToken);
        if (user is null)
            return NotFound(new { message = "Tài khoản không tồn tại" });
        return Ok(new { 
            email = user.Email, 
            trangThai = user.TrangThai, 
            hoTen = user.HoTen,
            vaiTro = user.MaVaiTroNavigation?.TenVaiTro,
            ngayTao = user.NgayTao
        });
    }

    [HttpPost("reset-password-debug")]
    public async Task<IActionResult> ResetPasswordDebug([FromBody] ResetPasswordDebugRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.ResetPasswordDebugAsync(request.Email, request.NewPassword, cancellationToken);
        if (!result.Success)
            return BadRequest(new { message = result.Message });
        return Ok(new { message = result.Message });
    }
}
