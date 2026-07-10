import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../../../lib/formatPrice'
import { exportReportsExcel } from '../../../lib/exportReportsExcel'
import { getReportsOverview } from '../../../services/reportAdminService'

function toInputDate(d) {
  const x = new Date(d)
  return x.toISOString().slice(0, 10)
}

function StatCard({ label, value, sub, tone = 'default' }) {
  const tones = {
    default: 'border-gray-100 bg-white',
    primary: 'border-primary/20 bg-primary-light/40',
    warn: 'border-amber-200 bg-amber-50/80',
    ok: 'border-emerald-200 bg-emerald-50/80',
  }
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}


function RevenueChart({ series, groupBy }) {
  const data = series ?? []
  const activePoints = data.filter((p) => Number(p.doanhThu) > 0 || Number(p.soDon) > 0)

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">Chưa có dữ liệu doanh thu trong kỳ.</p>
    )
  }

  if (activePoints.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">Không có doanh thu trong kỳ này.</p>
    )
  }

  const max = Math.max(...activePoints.map((p) => Number(p.doanhThu)), 1)
  const groupLabel =
    groupBy === 'month' ? 'tháng' : groupBy === 'week' ? 'tuần' : 'ngày'

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        {activePoints.length} {groupLabel} có doanh thu
        {groupBy === 'day' && data.length > 14 && (
          <span className="text-primary"> — nên chọn &quot;Theo tuần&quot; để gọn hơn</span>
        )}
      </p>

      <ul className="space-y-3">
        {activePoints.map((p) => {
          const value = Number(p.doanhThu)
          const pct = Math.max(4, (value / max) * 100)
          return (
            <li key={p.label}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-gray-800">{p.label}</span>
                <span className="shrink-0 text-right text-gray-600">
                  <span className="font-semibold text-gray-800">{formatPrice(value)}</span>
                  <span className="text-gray-400"> · {p.soDon} đơn</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function ReportsPage() {
  const today = useMemo(() => new Date(), [])
  const defaultFrom = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 29)
    return toInputDate(d)
  }, [])

  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(toInputDate(today))
  const [groupBy, setGroupBy] = useState('week')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getReportsOverview({ from, to, groupBy })
      setReport(data)
    } catch (err) {
      setError(err.message)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [from, to, groupBy])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  function handlePrint() {
    window.print()
  }

  return (
    <div className="flex flex-col gap-5 print:gap-3">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Báo cáo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Doanh thu, đơn hàng, món bán chạy và kho — dữ liệu thật từ database.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportReportsExcel(report)}
            disabled={!report || loading}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!report || loading}
            className="rounded-full border border-primary/30 bg-primary-light px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            In / PDF
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm print:hidden">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-gray-500">Từ ngày</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-gray-500">Đến ngày</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-gray-500">Nhóm doanh thu</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải báo cáo...</p>
      ) : report ? (
        <div id="reports-print-area" className="flex flex-col gap-5">
          <div className="hidden print:block">
            <h1 className="font-display text-xl font-bold">Báo cáo Flygo</h1>
            <p className="text-sm text-gray-600">
              {new Date(report.from).toLocaleDateString('vi-VN')} –{' '}
              {new Date(report.to).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Doanh thu (trừ hủy)"
              value={formatPrice(report.revenue?.tongDoanhThu)}
              sub={`Hoàn thành: ${formatPrice(report.revenue?.doanhThuHoanThanh)}`}
              tone="primary"
            />
            <StatCard
              label="Tổng đơn"
              value={report.orders?.tongDon ?? 0}
              sub={`${report.orders?.tyLeHoanThanh ?? 0}% hoàn thành · ${report.orders?.tyLeHuy ?? 0}% hủy`}
            />
            <StatCard
              label="Giảm giá"
              value={formatPrice(report.revenue?.tongGiamGia)}
            />
            <StatCard
              label="Nguyên liệu sắp hết"
              value={report.inventory?.sapHet ?? 0}
              sub={`/${report.inventory?.tongNguyenLieu ?? 0} mặt hàng`}
              tone={report.inventory?.sapHet > 0 ? 'warn' : 'ok'}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800">Doanh thu theo thời gian</h2>
              <RevenueChart series={report.revenueSeries} groupBy={report.groupBy ?? groupBy} />
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Doanh thu theo danh mục</h2>
              {(report.revenueByCategory ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
              ) : (
                <ul className="space-y-2">
                  {report.revenueByCategory.map((c) => (
                    <li
                      key={c.tenDanhMuc}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-gray-800">{c.tenDanhMuc}</span>
                      <span className="text-gray-600">
                        {formatPrice(c.doanhThu)} · {c.soLuong} sp
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Đơn hàng</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <dt className="text-gray-500">Hoàn thành</dt>
                  <dd className="text-lg font-bold text-emerald-700">{report.orders?.hoanThanh ?? 0}</dd>
                </div>
                <div className="rounded-lg bg-amber-50 px-3 py-2">
                  <dt className="text-gray-500">Đang xử lý</dt>
                  <dd className="text-lg font-bold text-amber-700">{report.orders?.dangXuLy ?? 0}</dd>
                </div>
                <div className="rounded-lg bg-red-50 px-3 py-2">
                  <dt className="text-gray-500">Đã hủy</dt>
                  <dd className="text-lg font-bold text-red-700">{report.orders?.daHuy ?? 0}</dd>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="text-gray-500">Tổng</dt>
                  <dd className="text-lg font-bold text-gray-800">{report.orders?.tongDon ?? 0}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Kho hàng trong kỳ</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Giá trị tồn ước tính</dt>
                  <dd className="font-semibold">{formatPrice(report.inventory?.giaTriTonUocTinh)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Phiếu nhập</dt>
                  <dd className="font-semibold">{report.inventory?.phieuNhapTrongKy ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Phiếu xuất (thủ công)</dt>
                  <dd className="font-semibold">{report.inventory?.phieuXuatTrongKy ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Tổng tiền nhập</dt>
                  <dd className="font-semibold">{formatPrice(report.inventory?.tongTienNhapTrongKy)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-800">Top món bán chạy</h2>
            {(report.bestSellers ?? []).length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có đơn hàng có chi tiết trong kỳ.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-gray-500">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Món</th>
                    <th className="pb-2">Danh mục</th>
                    <th className="pb-2 text-right">SL</th>
                    <th className="pb-2 text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {report.bestSellers.map((item, i) => (
                    <tr key={item.maSanPham} className="border-b border-gray-50">
                      <td className="py-2 text-gray-400">{i + 1}</td>
                      <td className="py-2 font-medium">{item.tenSanPham}</td>
                      <td className="py-2 text-gray-500">{item.tenDanhMuc}</td>
                      <td className="py-2 text-right">{item.soLuongBan}</td>
                      <td className="py-2 text-right">{formatPrice(item.doanhThu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {(report.inventory?.nguyenLieuSapHet ?? []).length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-amber-900">Nguyên liệu sắp hết</h2>
              <ul className="space-y-1 text-sm">
                {report.inventory.nguyenLieuSapHet.map((m) => (
                  <li key={m.maNguyenLieu} className="flex justify-between">
                    <span>{m.tenNguyenLieu}</span>
                    <span className="font-medium text-amber-800">
                      {m.soLuongTon} / {m.mucTonToiThieu} {m.donVi}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(report.dataGaps ?? []).length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 print:break-inside-avoid">
              <h2 className="mb-2 font-semibold text-gray-800">Chưa có / hạn chế trong database</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
                {report.dataGaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
