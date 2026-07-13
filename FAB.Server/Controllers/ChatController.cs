using FAB.Server.Models.DTOs;
using FAB.Server.Services.Chat;
using Microsoft.AspNetCore.Mvc;

namespace FAB.Server.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet("status")]
    public IActionResult Status()
    {
        return Ok(_chatService.GetStatus());
    }

    [HttpPost]
    public async Task<IActionResult> Send([FromBody] ChatRequest request, CancellationToken cancellationToken)
    {
        var result = await _chatService.SendAsync(request, cancellationToken);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }
}
