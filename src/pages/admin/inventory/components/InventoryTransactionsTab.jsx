import { useMemo, useState } from 'react'
import { formatPrice } from '../../../../lib/formatPrice'
import { exportInventoryTransactionsExcel } from '../../../../lib/exportInventoryExcel'
import InventoryTransactionStatCards from './InventoryTransactionStatCards'
import ReceiptFormModal from './ReceiptFormModal'
import ReceiptDetailModal, { summarizeReceiptLines } from './ReceiptDetailModal'

const SUB_TABS = [
  { id: 'import', label: 'Phiếu nhập' },
  { id: 'export', label: 'Phiếu xuất' },
]

const RECEIPT_STATUS = {
  ChoXacNhan: { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-800' },
  HoanThanh: { label: 'Hoàn thành', className: 'bg-emerald-100 text-emerald-800' },
}

function formatCompactMoney(value) {
  const num = Number(value)
  if (!num) return '0đ'
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (num >= 1_000_000) return `${Math.round(num / 1_000_000)}M`
  if (num >= 1_000) return `${Math.round(num / 1_000)}K`
  return formatPrice(num)
}

function isThisMonth(dateValue) {
  const date = new Date(dateValue)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

function buildStats(mode, receipts) {
  const monthReceipts = receipts.filter((row) =>
    isThisMonth(mode === 'import' ? row.ngayNhap : row.ngayXuat),
  )
  const pending = monthReceipts.filter((row) => row.trangThai === 'ChoXacNhan').length
  const completed = monthReceipts.filter((row) => row.trangThai === 'HoanThanh').length
  const total = monthReceipts.length

  if (mode === 'import') {
    const totalValue = monthReceipts.reduce((sum, row) => sum + Number(row.tongTien || 0), 0)
    return [
      { label: 'Tổng giá trị', value: formatCompactMoney(totalValue), icon: 'value', tone: 'amber' },
      { label: 'Chờ xác nhận', value: String(pending), icon: 'pending', tone: 'orange', highlight: true },
      { label: 'Hoàn thành', value: String(completed), icon: 'done', tone: 'green' },
      { label: 'Tổng phiếu tháng', value: String(total), icon: 'slips', tone: 'blue', exportable: true },
    ]
  }

  const totalQty = monthReceipts.reduce(
    (sum, row) => sum + (row.chiTiet || []).reduce((lineSum, line) => lineSum + Number(line.soLuong || 0), 0),
    0,
  )
  return [
    { label: 'Tổng dòng xuất', value: String(Math.round(totalQty)), icon: 'value', tone: 'amber' },
    { label: 'Chờ xác nhận', value: String(pending), icon: 'pending', tone: 'orange', highlight: true },
    { label: 'Hoàn thành', value: String(completed), icon: 'done', tone: 'green' },
    { label: 'Tổng phiếu tháng', value: String(total), icon: 'slips', tone: 'blue', exportable: true },
  ]
}

export default function InventoryTransactionsTab({
  items,
  allMaterials,
  importReceipts,
  exportReceipts,
  onSubmitReceipt,
  subTab = 'import',
  onSubTabChange,
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [detailReceipt, setDetailReceipt] = useState(null)
  const [detailMode, setDetailMode] = useState('import')

  const isImport = subTab === 'import'
  const activeReceipts = isImport ? importReceipts : exportReceipts
  const monthReceipts = useMemo(
    () => activeReceipts.filter((row) => isThisMonth(isImport ? row.ngayNhap : row.ngayXuat)),
    [activeReceipts, isImport],
  )
  const stats = useMemo(() => buildStats(subTab, activeReceipts), [subTab, activeReceipts])

  function handleExportExcel() {
    exportInventoryTransactionsExcel({
      stats,
      receipts: monthReceipts,
      typeLabel: isImport ? 'Phiếu nhập' : 'Phiếu xuất',
      filenamePrefix: isImport ? 'bao-cao-phieu-nhap' : 'bao-cao-phieu-xuat',
      isImport,
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSubTabChange?.(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                subTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
            isImport ? 'bg-primary hover:bg-primary-dark' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isImport ? '+ Tạo phiếu nhập' : '+ Tạo phiếu xuất'}
        </button>
      </div>

      <InventoryTransactionStatCards stats={stats} onExportExcel={handleExportExcel} />

      {isImport ? (
        <ImportReceiptTable
          receipts={activeReceipts.slice(0, 20)}
          onViewDetail={(row) => {
            setDetailMode('import')
            setDetailReceipt(row)
          }}
        />
      ) : (
        <ExportReceiptTable
          receipts={activeReceipts.slice(0, 20)}
          onViewDetail={(row) => {
            setDetailMode('export')
            setDetailReceipt(row)
          }}
        />
      )}

      <ReceiptDetailModal
        open={detailReceipt !== null}
        receipt={detailReceipt}
        mode={detailMode}
        onClose={() => setDetailReceipt(null)}
      />

      <ReceiptFormModal
        open={modalOpen}
        mode={subTab}
        items={items}
        allMaterials={allMaterials}
        onClose={() => setModalOpen(false)}
        onSubmit={(payload) => onSubmitReceipt(payload)}
      />
    </div>
  )
}

function StatusBadge({ status }) {
  const meta = RECEIPT_STATUS[status] || { label: status, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  )
}

function ImportReceiptTable({ receipts, onViewDetail }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b bg-emerald-50 px-4 py-3">
        <h4 className="font-semibold text-gray-800">Danh sách phiếu nhập gần đây</h4>
        <p className="mt-0.5 text-xs text-gray-500">Bấm dòng để xem nguyên liệu nhập</p>
      </div>
      {receipts.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Mã phiếu</th>
                <th className="px-4 py-2">Ngày nhập</th>
                <th className="px-4 py-2">Nguyên liệu</th>
                <th className="px-4 py-2">Số dòng</th>
                <th className="px-4 py-2">Tổng tiền</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipts.map((row) => (
                <tr
                  key={row.maPhieuNhap}
                  className="cursor-pointer transition hover:bg-emerald-50/40"
                  onClick={() => onViewDetail?.(row)}
                >
                  <td className="px-4 py-2.5 font-semibold">#{row.maPhieuNhap}</td>
                  <td className="px-4 py-2.5 text-gray-600">{new Date(row.ngayNhap).toLocaleString('vi-VN')}</td>
                  <td className="max-w-[220px] px-4 py-2.5 text-sm text-gray-700">
                    {summarizeReceiptLines(row.chiTiet)}
                  </td>
                  <td className="px-4 py-2.5">{row.soDong}</td>
                  <td className="px-4 py-2.5 font-semibold">{formatPrice(row.tongTien)}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={row.trangThai} />
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{row.ghiChu || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function ExportReceiptTable({ receipts, onViewDetail }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b bg-red-50 px-4 py-3">
        <h4 className="font-semibold text-gray-800">Danh sách phiếu xuất gần đây</h4>
        <p className="mt-0.5 text-xs text-gray-500">Bấm dòng để xem nguyên liệu đã xuất</p>
      </div>
      {receipts.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Mã phiếu</th>
                <th className="px-4 py-2">Ngày xuất</th>
                <th className="px-4 py-2">Lý do</th>
                <th className="px-4 py-2">Nguyên liệu xuất</th>
                <th className="px-4 py-2">Số dòng</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipts.map((row) => (
                <tr
                  key={row.maPhieuXuat}
                  className="cursor-pointer transition hover:bg-red-50/40"
                  onClick={() => onViewDetail?.(row)}
                >
                  <td className="px-4 py-2.5 font-semibold">#{row.maPhieuXuat}</td>
                  <td className="px-4 py-2.5 text-gray-600">{new Date(row.ngayXuat).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-2.5">{row.lyDoXuat}</td>
                  <td className="max-w-[260px] px-4 py-2.5 text-sm font-medium text-gray-800">
                    {summarizeReceiptLines(row.chiTiet)}
                  </td>
                  <td className="px-4 py-2.5">{row.soDong}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={row.trangThai} />
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{row.ghiChu || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
