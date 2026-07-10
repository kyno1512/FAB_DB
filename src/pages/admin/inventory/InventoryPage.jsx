import { useCallback, useEffect, useState } from 'react'
import { confirmAction, showError, showSuccess } from '../../../lib/swal'
import {
  adjustInventoryStock,
  createExportReceipt,
  createExportReceiptFIFO,
  createImportReceipt,
  createImportReceiptWithBatch,
  createInventoryItem,
  deleteInventoryItem,
  getAllMaterialsForSelect,
  getExportReceipts,
  getImportReceipts,
  getInventoryList,
  getInventoryMovements,
  updateInventoryItem,
} from '../../../services/inventoryAdminService'
import InventoryFormModal from './components/InventoryFormModal'
import InventoryAdjustModal from './components/InventoryAdjustModal'
import InventoryTabBar from './components/InventoryTabBar'
import InventoryOverviewTab from './components/InventoryOverviewTab'
import InventoryMaterialsTab from './components/InventoryMaterialsTab'
import InventoryTransactionsTab from './components/InventoryTransactionsTab'
import InventoryHistoryTab from './components/InventoryHistoryTab'

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [transactionSubTab, setTransactionSubTab] = useState('import')
  const [items, setItems] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [movements, setMovements] = useState([])
  const [importReceipts, setImportReceipts] = useState([])
  const [exportReceipts, setExportReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [allMaterials, setAllMaterials] = useState([])
  const [formItem, setFormItem] = useState(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [adjustItem, setAdjustItem] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [inventoryData, movementData, importData, exportData, allMaterialsData] = await Promise.all([
        getInventoryList({ search: search.trim() || undefined, page, pageSize }),
        getInventoryMovements(100),
        getImportReceipts(100),
        getExportReceipts(100),
        getAllMaterialsForSelect(),
      ])
      setItems(inventoryData?.items ?? [])
      setTotalCount(inventoryData?.totalCount ?? 0)
      setMovements(Array.isArray(movementData) ? movementData : [])
      setImportReceipts(Array.isArray(importData) ? importData : [])
      setExportReceipts(Array.isArray(exportData) ? exportData : [])
      setAllMaterials(Array.isArray(allMaterialsData) ? allMaterialsData : [])
    } catch (err) {
      setError(err.message)
      setItems([])
      setTotalCount(0)
      setMovements([])
      setImportReceipts([])
      setExportReceipts([])
      setAllMaterials([])
    } finally {
      setLoading(false)
    }
  }, [search, page, pageSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [search])

  function openCreate() {
    setFormItem(undefined)
    setFormOpen(true)
  }

  function openEdit(item) {
    setFormItem(item)
    setFormOpen(true)
  }

  async function handleSubmit(payload) {
    if (formItem) {
      await updateInventoryItem(formItem.maNguyenLieu, payload)
      await showSuccess('Đã cập nhật nguyên liệu.')
    } else {
      await createInventoryItem(payload)
      await showSuccess('Đã thêm nguyên liệu.')
    }
    setFormOpen(false)
    await fetchData()
  }

  async function handleAdjustById(id, payload) {
    await adjustInventoryStock(id, payload)
    await showSuccess('Đã cập nhật tồn kho.')
    await fetchData()
  }

  async function handleSubmitReceipt({ ghiChu, lines }, mode) {
    if (mode === 'import') {
      // Nhập kho - mỗi dòng là 1 lô mới
      const payload = {
        ghiChu: ghiChu?.trim() || null,
        lines: lines.map((line) => ({
          maNguyenLieu: line.maNguyenLieu,
          soLuong: line.soLuong,
          donGia: line.donGia || 0,
          ngaySanXuat: line.ngaySanXuat || null,
          hanSuDung: line.hanSuDung, // DateOnly string
        })),
      }
      await createImportReceiptWithBatch(payload)
      await showSuccess('Đã tạo phiếu nhập kho với lô mới.')
    } else {
      // Xuất kho - tự động FIFO
      const payload = {
        ghiChu: ghiChu?.trim() || null,
        lines: lines.map((line) => ({
          maNguyenLieu: line.maNguyenLieu,
          soLuong: line.soLuong,
        })),
        lyDoXuat: ghiChu?.trim() || 'Xuất kho',
      }
      await createExportReceiptFIFO(payload)
      await showSuccess('Đã tạo phiếu xuất kho (FIFO).')
    }

    await fetchData()
  }

  async function handleDelete(item, options = {}) {
    if (!options.silent) {
      const confirmed = await confirmAction({
        icon: 'warning',
        title: `Xóa ${item.tenNguyenLieu}?`,
        text: 'Nguyên liệu sẽ bị xóa khỏi kho.',
        confirmText: 'Xóa',
        cancelText: 'Giữ lại',
        confirmButtonColor: '#dc2626',
      })
      if (!confirmed) return
    }

    try {
      await deleteInventoryItem(item.maNguyenLieu)
      if (!options.silent) await showSuccess('Đã xóa nguyên liệu.')
      await fetchData()
    } catch (err) {
      await showError(err.message)
      throw err
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">Quản lý Kho hàng</h2>
        <p className="mt-1 text-sm text-gray-500">
          Theo dõi tồn kho nguyên liệu, phiếu nhập/xuất và cảnh báo hết hàng.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <InventoryTabBar active={activeTab} onChange={setActiveTab} />

        {activeTab === 'overview' && (
          <InventoryOverviewTab
            items={items}
            totalCount={totalCount}
            movements={movements}
            importReceiptCount={importReceipts.length}
            exportReceiptCount={exportReceipts.length}
            onQuickImport={(item) => setAdjustItem(item)}
            onGoTab={(tab, opts) => {
              if (opts?.subTab) setTransactionSubTab(opts.subTab)
              setActiveTab(tab)
            }}
          />
        )}

        {activeTab === 'materials' && (
          <InventoryMaterialsTab
            items={items}
            loading={loading}
            error={error}
            search={search}
            onSearchChange={setSearch}
            onEdit={openEdit}
            onDelete={handleDelete}
            onCreate={openCreate}
            page={page}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}

        {activeTab === 'transactions' && (
          <InventoryTransactionsTab
            items={items}
            allMaterials={allMaterials}
            importReceipts={importReceipts}
            exportReceipts={exportReceipts}
            onSubmitReceipt={(payload) => handleSubmitReceipt(payload, transactionSubTab)}
            subTab={transactionSubTab}
            onSubTabChange={setTransactionSubTab}
          />
        )}

        {activeTab === 'history' && (
          <InventoryHistoryTab
            items={items}
            onCreateMovement={async ({ maNguyenLieu, soLuongThayDoi, ghiChu }) => {
              await adjustInventoryStock(maNguyenLieu, { soLuongThayDoi, ghiChu })
            }}
            onChanged={fetchData}
          />
        )}
      </div>

      <InventoryFormModal open={formOpen} item={formItem} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <InventoryAdjustModal
        open={Boolean(adjustItem)}
        item={adjustItem}
        onClose={() => setAdjustItem(null)}
        onSubmit={async (payload) => {
          await handleAdjustById(adjustItem.maNguyenLieu, payload)
          setAdjustItem(null)
        }}
      />
    </div>
  )
}
