using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FAB.Server.Common;
using FAB.Server.Services.Upload;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/uploads")]
public class UploadsController : ControllerBase
{
    private readonly IFileUploadService _uploadService;

    public UploadsController(IFileUploadService uploadService)
    {
        _uploadService = uploadService;
    }

    [Authorize]
    [HttpPost("avatar")]
    [RequestSizeLimit(5_242_880)]
    public async Task<IActionResult> UploadAvatar(IFormFile file, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userId, out var maNguoiDung))
            return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });

        var result = await _uploadService.SaveAvatarAsync(file, maNguoiDung, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { url = result.Data });
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPost("news")]
    [RequestSizeLimit(52_428_800)]
    public async Task<IActionResult> UploadNewsImages(
        [FromForm] List<IFormFile> files,
        CancellationToken cancellationToken)
    {
        var result = await _uploadService.SaveNewsImagesAsync(files, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { urls = result.Data });
    }

    [Authorize(Policy = AuthConstants.AdminPolicyName)]
    [HttpPost("products")]
    [RequestSizeLimit(5_242_880)]
    public async Task<IActionResult> UploadProductImage(IFormFile file, CancellationToken cancellationToken)
    {
        var result = await _uploadService.SaveProductImageAsync(file, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(new { url = result.Data });
    }
}
