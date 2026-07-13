using FAB.Server.Common;
using FAB.Server.Models.DTOs.Inventory;

namespace FAB.Server.Services.Admin;

public interface IInventoryAdminService
{
    Task<ServiceResult<List<InventoryItemDto>>> GetAllAsync(string? search = null, CancellationToken ct = default);
    Task<ServiceResult<List<InventoryItemDto>>> GetAllForSelectAsync(CancellationToken ct = default);
    Task<ServiceResult<InventoryItemListDto>> GetListAsync(string? search, int page, int pageSize, CancellationToken ct = default);
    Task<ServiceResult<InventoryItemDto>> CreateAsync(CreateInventoryRequest request, CancellationToken ct = default);
    Task<ServiceResult<InventoryItemDto>> UpdateAsync(int id, UpdateInventoryRequest request, CancellationToken ct = default);
    Task<ServiceResult<InventoryItemDto>> AdjustStockAsync(
        int id, AdjustInventoryRequest request, int? nguoiThucHien, CancellationToken ct = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<List<InventoryHistoryItemDto>>> GetHistoryAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<List<InventoryHistoryItemDto>>> GetRecentMovementsAsync(
        int limit = 100,
        DateTime? from = null,
        DateTime? to = null,
        string? search = null,
        string? loai = null,
        CancellationToken ct = default);
    Task<ServiceResult<int>> DeleteMovementsAsync(IReadOnlyList<int> ids, CancellationToken ct = default);
    Task<ServiceResult<List<ImportReceiptListItemDto>>> GetImportReceiptsAsync(int limit = 100, CancellationToken ct = default);
    Task<ServiceResult<List<ExportReceiptListItemDto>>> GetExportReceiptsAsync(int limit = 100, CancellationToken ct = default);
    Task<ServiceResult<ImportReceiptListItemDto>> CreateImportReceiptAsync(
        CreateImportReceiptRequest request, int nguoiTao, CancellationToken ct = default);
    Task<ServiceResult<ExportReceiptListItemDto>> CreateExportReceiptAsync(
        CreateExportReceiptRequest request, int nguoiTao, CancellationToken ct = default);
    Task<ServiceResult<List<InventoryBatchDetailDto>>> GetBatchesByMaterialAsync(int maNguyenLieu, CancellationToken ct = default);
    Task<ServiceResult<List<MaterialRecipeDto>>> GetRecipesByMaterialAsync(int maNguyenLieu, CancellationToken ct = default);

    // Quản lý Lô nguyên liệu
    Task<ServiceResult<List<LoDto>>> GetLosByMaterialAsync(int maNguyenLieu, CancellationToken ct = default);
    Task<ServiceResult<LoDto>> CreateLoAsync(CreateLoRequest request, CancellationToken ct = default);
    Task<ServiceResult<LoDto>> UpdateLoAsync(int maLo, UpdateLoRequest request, CancellationToken ct = default);
    Task<ServiceResult> DeleteLoAsync(int maLo, CancellationToken ct = default);
    Task<ServiceResult<ImportReceiptListItemDto>> CreateImportReceiptWithBatchAsync(
        CreateImportReceiptWithBatchRequest request, int nguoiTao, CancellationToken ct = default);
    Task<ServiceResult<ExportReceiptListItemDto>> CreateExportReceiptFIFOAsync(
        CreateExportReceiptRequest request, int nguoiTao, CancellationToken ct = default);
}
