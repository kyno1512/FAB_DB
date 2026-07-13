using FAB.Server.Models;

namespace FAB.Server.Services.Auth;

public interface IJwtTokenService
{
    string GenerateToken(NguoiDung user);
}
