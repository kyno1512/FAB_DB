import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../../../lib/formatPrice'
import { confirmAction, showError, showSuccess } from '../../../lib/swal'
import { useDebounce } from '../../../hooks/useDebounce'
import { IconSearch } from '../dashboard/components/adminIcons'
import AdminTableActions, { AdminDeleteButton } from '../../../components/AdminTableActions'
import { deleteAdminOrders, getAdminOrders, updateOrderStatus } from '../../../services/orderAdminService'
import OrderDetailModal from './components/OrderDetailModal'
import DeliveryApprovalModal from './components/DeliveryApprovalModal'
import MenuPagination from '../menu/components/MenuPagination'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'ChoThanhToan', label: 'Chờ thanh toán' },
  { value: 'ChoBep', label: 'Chờ bếp' },
  { value: 'DangChuanBi', label: 'Đang chuẩn bị' },
  { value: 'ChoGiaoHang', label: 'Chờ giao hàng' },
  { value: 'DangGiao', label: 'Đang giao' },
  { value: 'HoanThanh', label: 'Hoàn thành' },
  { value: 'DaHuy', label: 'Đã hủy' },
  { value: 'ChoHoanTien', label: 'Chờ hoàn tiền', highlight: true },
]

const STATUS_LABELS = {
  ChoThanhToan: 'Chờ thanh toán',
  ChoBep: 'Chờ bếp',
  DangChuanBi: 'Đang chuẩn bị',
  ChoGiaoHang: 'Chờ giao hàng',
  DangGiao: 'Đang giao',
  HoanThanh: 'Hoàn thành',
  DaHuy: 'Đã hủy',
  ChoHoanTien: 'Chờ hoàn tiền',
}

const STATUS_COLORS = {
  ChoThanhToan: 'bg-yellow-100 text-yellow-700',
  ChoBep: 'bg-orange-100 text-orange-700',
  DangChuanBi: 'bg-blue-100 text-blue-700',
  ChoGiaoHang: 'bg-indigo-100 text-indigo-700',
  DangGiao: 'bg-cyan-100 text-cyan-700',
  HoanThanh: 'bg-green-100 text-green-700',
  DaHuy: 'bg-red-100 text-red-700',
  ChoHoanTien: 'bg-purple-100 text-purple-700',
}

function getPaymentBadge(order) {
  const isCod = order.phuongThucThanhToan === 'COD'
  if (isCod) {
    return {
      label: 'COD',
      sub: 'Trả khi nhận',
      className: 'bg-amber-100 text-amber-800',
    }
  }

  const paid = order.trangThaiThanhToan === 'DaThanhToan'
  return {
    label: 'VNPay',
    sub: paid ? 'Đã thanh toán' : 'Chờ thanh toán',
    className: paid ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800',
  }
}

function getNextAction(order) {
  const { trangThai, phuongThucThanhToan } = order

  if (trangThai === 'ChoThanhToan') {
    return { next: 'ChoBep', label: 'Xác nhận VNPay', needsShipper: false }
  }
  if (trangThai === 'ChoBep') {
    return {
      next: 'DangChuanBi',
      label: phuongThucThanhToan === 'COD' ? 'COD — Chuẩn bị món' : 'Bắt đầu chuẩn bị',
      needsShipper: false,
    }
  }
  if (trangThai === 'DangChuanBi') {
    return { next: 'ChoGiaoHang', label: 'Chuyển chờ giao', needsShipper: false }
  }
  if (trangThai === 'ChoGiaoHang') {
    return { next: 'DangGiao', label: 'Duyệt & phân shipper', needsShipper: true }
  }
  if (trangThai === 'DangGiao') {
    return {
      next: 'HoanThanh',
      label: phuongThucThanhToan === 'COD' ? 'Hoàn thành & thu COD' : 'Hoàn thành đơn',
      needsShipper: false,
    }
  }
  return null
}

function getCustomerDisplayName(order) {
  return order.tenKhachHang || order.nguoiNhan || 'Khách vãng lai'
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

function matchesSearch(order, keyword) {
  if (!keyword) return true

  const payment = getPaymentBadge(order)
  const haystack = normalizeSearchText(
    [
      order.maDonHang,
      `#${order.maDonHang}`,
      getCustomerDisplayName(order),
      order.soDienThoai,
      order.sdtNguoiNhan,
      order.diaChiGiao,
      order.tenShipper,
      order.phuongThucThanhToan,
      order.trangThaiThanhToan,
      order.ghiChu,
      STATUS_LABELS[order.trangThai],
      payment.label,
      payment.sub,
      'Giao tận nơi',
    ].join(' '),
  )

  return haystack.includes(normalizeSearchText(keyword))
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(normalizeSearchText(search), 250)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [updating, setUpdating] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [shipperOrder, setShipperOrder] = useState(null)

  const pendingRefundCount = useMemo(
    () => orders.filter((o) => o.yeuCauHuy && o.trangThaiHuy === 'ChoHoanTien').length,
    [orders],
  )

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // Nếu filter là "Chờ hoàn tiền" thì dùng trangThaiHuy
      const params = {}
      if (filterStatus === 'ChoHoanTien') {
        params.trangThaiHuy = 'ChoHoanTien'
      } else if (filterStatus) {
        params.trangThai = filterStatus
      }
      const data = await getAdminOrders(params)
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    setPage(1)
  }, [filterStatus, debouncedSearch])

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesSearch(order, debouncedSearch)),
    [orders, debouncedSearch],
  )

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const pagedOrders = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, safePage, pageSize])

  const visibleIds = useMemo(
    () => pagedOrders.map((order) => order.maDonHang),
    [pagedOrders],
  )

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id))
      }
      return [...new Set([...prev, ...visibleIds])]
    })
  }

  async function handleDeleteOne(order) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa đơn #${order.maDonHang}?`,
      text: 'Đơn hàng sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    setDeleting(true)
    setError('')
    try {
      await deleteAdminOrders([order.maDonHang])
      setSelectedIds((prev) => prev.filter((id) => id !== order.maDonHang))
      await fetchOrders()
      await showSuccess(`Đã xóa đơn #${order.maDonHang}.`)
    } catch (err) {
      setError(err.message)
      await showError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return

    const count = selectedIds.length
    const label = selectedIds.map((id) => `#${id}`).join(', ')
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${count} đơn hàng?`,
      text: `${label}. Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    setDeleting(true)
    setError('')
    try {
      await deleteAdminOrders(selectedIds)
      setSelectedIds([])
      await fetchOrders()
      await showSuccess(`Đã xóa ${count} đơn hàng.`)
    } catch (err) {
      setError(err.message)
      await showError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => orders.some((order) => order.maDonHang === id)))
  }, [orders])

  async function applyStatus(order, nextStatus, deliveryOptions) {
    setUpdating(order.maDonHang)
    try {
      await updateOrderStatus(order.maDonHang, nextStatus, deliveryOptions)
      setShipperOrder(null)
      await fetchOrders()
    } catch (err) {
      await showError(err.message)
      throw err
    } finally {
      setUpdating(null)
    }
  }

  function handleAdvanceStatus(order) {
    const action = getNextAction(order)
    if (!action) return

    if (action.needsShipper) {
      setShipperOrder(order)
      return
    }

    applyStatus(order, action.next)
  }

  async function handleCancel(order) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Hủy đơn #${order.maDonHang}?`,
      text: 'Đơn hàng sẽ chuyển sang trạng thái đã hủy.',
      confirmText: 'Hủy đơn',
      cancelText: 'Không',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return
    await applyStatus(order, 'DaHuy')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h2>
        <p className="mt-1 text-sm text-gray-500">
          Đơn đặt web · giao tận nơi. Phân biệt COD / VNPay và gán shipper khi duyệt giao.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-gray-500 shadow-sm">
          <IconSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, khách hàng, SĐT, địa chỉ, shipper..."
            className="w-full border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </div>

        {selectedIds.length > 0 && (
          <AdminDeleteButton
            count={selectedIds.length}
            loading={deleting}
            onClick={handleDeleteSelected}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilterStatus(opt.value)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filterStatus === opt.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            } ${opt.highlight && !filterStatus ? 'border-2 border-red-400' : ''}`}
          >
            {opt.label}
            {opt.highlight && pendingRefundCount > 0 && filterStatus !== opt.value && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {pendingRefundCount > 9 ? '9+' : pendingRefundCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[1020px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  disabled={pagedOrders.length === 0}
                  className="size-3.5 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary/30"
                  aria-label="Chọn tất cả đơn hiển thị"
                />
              </th>
              <th className="px-5 py-3 font-semibold text-gray-600">Mã đơn</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Khách hàng</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Thanh toán</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Giao hàng</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Tổng tiền</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Trạng thái</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Shipper</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Thời gian</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center text-gray-400">
                  Đang tải đơn hàng...
                </td>
              </tr>
            ) : pagedOrders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center text-gray-400">
                  {orders.length === 0 ? 'Chưa có đơn hàng nào.' : 'Không tìm thấy đơn phù hợp.'}
                </td>
              </tr>
            ) : (
              pagedOrders.map((order) => {
                const payment = getPaymentBadge(order)
                const action = getNextAction(order)
                const isSelected = selectedIds.includes(order.maDonHang)

                return (
                  <tr
                    key={order.maDonHang}
                    className={`cursor-pointer border-b border-gray-50 transition hover:bg-gray-50/60 ${
                      isSelected ? 'bg-primary-light/30' : ''
                    }`}
                    onClick={() => {
                      setSelectedOrderId(order.maDonHang)
                      setShowDetailModal(true)
                    }}
                  >
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(order.maDonHang)}
                        className="size-3.5 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary/30"
                        aria-label={`Chọn đơn #${order.maDonHang}`}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="cursor-pointer font-semibold text-primary hover:underline">
                        #{order.maDonHang}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-800">
                        {getCustomerDisplayName(order)}
                      </div>
                      {(order.soDienThoai || order.sdtNguoiNhan) && (
                        <div className="text-xs text-gray-400">
                          {order.soDienThoai || order.sdtNguoiNhan}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${payment.className}`}>
                        {payment.label}
                      </span>
                      <div className="mt-0.5 text-[11px] text-gray-400">{payment.sub}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
                        🛵 Giao tận nơi
                      </span>
                      {(order.diaChiGiao || order.nguoiNhan) && (
                        <div className="mt-0.5 max-w-[180px] truncate text-[11px] text-gray-400">
                          {order.diaChiGiao || order.nguoiNhan}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      {formatPrice(order.tongThanhToan)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_COLORS[order.trangThai] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {STATUS_LABELS[order.trangThai] || order.trangThai}
                      </span>
                      {order.yeuCauHuy && order.trangThaiHuy === 'ChoHoanTien' && (
                        <span className="mt-1 inline-block rounded-full bg-purple-100 px-3 py-0.5 text-[10px] font-bold text-purple-700">
                          🔄 CHỜ HOÀN TIỀN
                        </span>
                      )}
                      {order.yeuCauHuy && order.trangThaiHuy === 'DaHoanTien' && (
                        <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-0.5 text-[10px] font-bold text-green-700">
                          ✓ ĐÃ HOÀN TIỀN
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">
                      {order.tenShipper || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(order.ngayTao).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminTableActions
                          deleteTitle="Xóa đơn"
                          onDelete={() => handleDeleteOne(order)}
                        />
                        {action && (
                          <button
                            type="button"
                            disabled={updating === order.maDonHang}
                            onClick={() => handleAdvanceStatus(order)}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
                          >
                            {updating === order.maDonHang ? '...' : action.label}
                          </button>
                        )}
                        {order.trangThai !== 'HoanThanh' && order.trangThai !== 'DaHuy' && (
                          <button
                            type="button"
                            disabled={updating === order.maDonHang}
                            onClick={() => handleCancel(order)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {!loading && filteredOrders.length > 0 && (
          <div className="border-t border-gray-100 p-4">
            <MenuPagination
              page={safePage}
              totalPages={totalPages}
              totalCount={filteredOrders.length}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
              itemLabel="đơn hàng"
            />
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && showDetailModal && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setShowDetailModal(false)}
          onSuccess={() => {
            setShowDetailModal(false)
            fetchOrders()
          }}
        />
      )}

      {shipperOrder && (
        <DeliveryApprovalModal
          order={shipperOrder}
          onClose={() => setShipperOrder(null)}
          onConfirm={(options) => applyStatus(shipperOrder, 'DangGiao', options)}
        />
      )}
    </div>
  )
}
