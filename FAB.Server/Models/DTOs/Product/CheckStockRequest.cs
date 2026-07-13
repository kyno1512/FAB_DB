namespace FAB.Server.Models.DTOs.Product;

public class CheckStockRequest
{
    public List<StockLine> Lines { get; set; } = [];
}

public class StockLine
{
    public int MaSanPham { get; set; }
    public int SoLuong { get; set; }
}

public class CheckStockResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? BottleneckIngredient { get; set; }
    public int? MaxAvailable { get; set; }
}
