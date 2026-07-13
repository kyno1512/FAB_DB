namespace FAB.Server.Models.DTOs;

public class ModulePermissionDto
{
    public int MaQuyen { get; set; }
    public string TenQuyen { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string? Module { get; set; }
    public bool Tat { get; set; }
}

public class StaffModulePermissionsResponse
{
    public int MaNguoiDung { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public List<ModulePermissionDto> Permissions { get; set; } = new();
}

public class UpdateStaffPermissionsRequest
{
    public List<ModulePermissionUpdate> Permissions { get; set; } = new();
}

public class ModulePermissionUpdate
{
    public int MaQuyen { get; set; }
    public bool Tat { get; set; }
}
