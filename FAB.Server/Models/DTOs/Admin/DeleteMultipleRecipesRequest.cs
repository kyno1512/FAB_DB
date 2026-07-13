namespace FAB.Server.Models.DTOs;

public class DeleteMultipleRecipesRequest
{
    public List<int> MaCongThucIds { get; set; } = [];
}
