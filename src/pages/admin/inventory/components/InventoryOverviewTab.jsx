import { formatPrice } from '../../../../lib/formatPrice'

function formatQty(value, unit) {
  const num = Number(value)
  if (Number.isNaN(num)) return `0 ${unit}`
  return `${num.toLocaleString('vi-VN')} ${unit}`
}

const STAT_ICONS = {
  materials: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.3 7.7L12 12l8.7-4.3M12 22V12" />
    </svg>
  ),
  warning: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  value: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 16h2" strokeLinecap="round" />
    </svg>
  ),
  slips: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h6" strokeLinecap="round" />
    </svg>
  ),
}

const TONE_CLASS = {
  default: 'bg-blue-50 text-blue-600',
  warning: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
}

export default function InventoryOverviewTab({
  items,
  totalCount,
  movements,
  importReceiptCount = 0,
  exportReceiptCount = 0,
  onQuickImport,
  onGoTab,
}) {
  const lowStock = items.filter((x) => x.trangThaiTon === 'SapHet' || x.trangThaiTon === 'HetHang')
  const expiring = items.filter((x) => x.trangThaiHSD === 'SapHetHan' || x.trangThaiHSD === 'DaHetHan')
  const inventoryValue = items.reduce(
    (sum, item) => sum + Number(item.soLuongTon || 0) * Number(item.giaNhap || 0),
    0,
  )

  const totalMaterials = Math.max(totalCount ?? 0, items.length)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Tổng nguyên liệu"
          value={totalMaterials}
          icon={STAT_ICONS.materials}
          tone="default"
          onClick={() => onGoTab('materials')}
        />
        <StatCard
          label="Sắp hết / Hết"
          value={lowStock.length}
          icon={STAT_ICONS.warning}
          tone="warning"
          highlight={lowStock.length > 0}
          onClick={() => onGoTab('materials')}
        />
        <StatCard
          label="Giá trị tồn kho"
          value={formatPrice(inventoryValue)}
          icon={STAT_ICONS.value}
          tone="emerald"
          onClick={() => onGoTab('materials')}
        />
        <StatCard
          label="Phiếu nhập / xuất"
          value={`${importReceiptCount} / ${exportReceiptCount}`}
          icon={STAT_ICONS.slips}
          tone="violet"
          onClick={() => onGoTab('history')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="flex min-h-[320px] flex-col rounded-[18px] border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-700">
                {STAT_ICONS.warning}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">Cảnh báo sắp hết</h3>
                <p className="text-xs text-gray-500">{lowStock.length} mặt hàng cần chú ý</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoTab('transactions', { subTab: 'import' })}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm ring-1 ring-amber-200/80 transition hover:bg-primary hover:text-white"
            >
              Nhập kho →
            </button>
          </div>

          <div className="flex flex-1 flex-col">
            {lowStock.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-amber-200/70 bg-white/70 px-4 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-3 font-medium text-gray-800">Tồn kho ổn định</p>
                <p className="mt-1 text-sm text-gray-500">Tất cả nguyên liệu đang ở mức an toàn.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((item) => {
                  const min = Number(item.mucTonToiThieu) || 1
                  const current = Number(item.soLuongTon) || 0
                  const pct = Math.min(100, Math.round((current / min) * 100))
                  const isOut = item.trangThaiTon === 'HetHang'

                  return (
                    <li
                      key={item.maNguyenLieu}
                      className="rounded-xl border border-white/80 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-gray-800">{item.tenNguyenLieu}</p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                                isOut ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {isOut ? 'Hết hàng' : 'Sắp hết'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Còn {formatQty(item.soLuongTon, item.donVi)} · Tối thiểu{' '}
                            {formatQty(item.mucTonToiThieu, item.donVi)}
                          </p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full transition-all ${isOut ? 'bg-red-500' : 'bg-amber-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onQuickImport(item)}
                          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                        >
                          Nhập nhanh
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="flex min-h-[320px] flex-col rounded-[18px] border border-red-200/80 bg-gradient-to-br from-red-50/80 to-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-red-100 text-red-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">Cảnh báo hết hạn</h3>
                <p className="text-xs text-gray-500">{expiring.length} mặt hàng cần ưu tiên</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoTab('materials')}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm ring-1 ring-red-200/80 transition hover:bg-primary hover:text-white"
            >
              Xem chi tiết →
            </button>
          </div>

          <div className="flex flex-1 flex-col">
            {expiring.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-red-200/70 bg-white/70 px-4 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-3 font-medium text-gray-800">HSD ổn định</p>
                <p className="mt-1 text-sm text-gray-500">Tất cả nguyên liệu còn hạn sử dụng.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {expiring.map((item) => {
                  const isExpired = item.trangThaiHSD === 'DaHetHan'
                  const daysLeft = Number(item.soNgayConLai) || 0
                  // Nếu lô gần nhất hết hạn nhưng còn hàng → có lô khác còn hạn
                  const hasOtherBatches = item.soLuongTon > 0

                  return (
                    <li
                      key={item.maNguyenLieu}
                      className="rounded-xl border border-white/80 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-gray-800">{item.tenNguyenLieu}</p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                                isExpired || daysLeft <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {isExpired || daysLeft <= 0 ? 'Hết hạn' : `${daysLeft} ngày`}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.hanSuDungDen
                              ? `HSD gần nhất: ${new Date(`${item.hanSuDungDen}T00:00:00`).toLocaleDateString('vi-VN')}`
                              : 'Không có HSD'}
                            {item.tongSoLo > 0 && ` · ${item.tongSoLo} lô nhập`}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.soLoSapHetHan > 0 && (
                              <span className="text-amber-600">
                                ⚠️ {item.soLoSapHetHan} lô sắp hết hạn
                              </span>
                            )}
                            {item.soLoDaHetHan > 0 && (
                              <span className="text-red-600">
                                {item.soLoSapHetHan > 0 && ' · '}
                                ❌ {item.soLoDaHetHan} lô đã hết hạn
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onQuickImport(item)}
                          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                        >
                          Nhập nhanh
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="flex min-h-[320px] flex-col rounded-[18px] border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">Biến động gần đây</h3>
              <p className="text-xs text-gray-500">{movements.length} ghi nhận gần nhất</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onGoTab('history')}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Xem tất cả →
          </button>
        </div>

        <div className="flex flex-1 flex-col">
          {movements.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center">
              <p className="font-medium text-gray-700">Chưa có biến động</p>
              <p className="mt-1 text-sm text-gray-500">Phiếu nhập/xuất sẽ hiện tại đây.</p>
            </div>
          ) : (
            <ul className="relative space-y-0">
              {movements.slice(0, 6).map((row, index) => {
                const isImport = row.loaiThayDoi === 'Nhap'
                const isLast = index === Math.min(movements.length, 6) - 1

                return (
                  <li key={row.maLichSu} className="relative flex gap-3 pb-4">
                    {!isLast && (
                      <span
                        className="absolute left-[11px] top-7 h-[calc(100%-12px)] w-px bg-gray-200"
                        aria-hidden
                      />
                    )}
                    <span
                      className={`relative z-[1] mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                        isImport ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {isImport ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-800">{row.tenNguyenLieu}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {isImport ? 'Nhập kho' : 'Xuất kho'} ·{' '}
                            {new Date(row.ngayGhiNhan).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-lg px-2 py-1 text-sm font-bold ${
                            isImport ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {row.soLuongThayDoi > 0 ? '+' : ''}
                          {Number(row.soLuongThayDoi).toLocaleString('vi-VN')} {row.donVi}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, icon, tone = 'default', highlight = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[18px] border border-gray-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-primary/20 hover:shadow-md"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-amber-600' : 'text-gray-800'}`}>{value}</p>
      </div>
      <div
        className={`ml-3 flex size-11 shrink-0 items-center justify-center rounded-full ${TONE_CLASS[tone] || TONE_CLASS.default}`}
      >
        {icon}
      </div>
    </button>
  )
}
