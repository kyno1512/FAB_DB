import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminTableActions, { AdminDeleteButton } from '../../../components/AdminTableActions'
import { useDebounce } from '../../../hooks/useDebounce'
import { formatPrice } from '../../../lib/formatPrice'
import { confirmAction, showError, showSuccess } from '../../../lib/swal'
import { IconSearch } from '../dashboard/components/adminIcons'
import { getProducts } from '../../../services/productService'
import {
  applyHotDeal,
  createVoucher,
  deleteVoucher,
  getVouchers,
  removeHotDeal,
  updateVoucher,
} from '../../../services/voucherAdminService'
import VoucherFormModal from './components/VoucherFormModal'
import HotDealModal from './components/HotDealModal'

const tabs = [
  {
    id: 'codes',
    label: 'Mã khuyến mãi',
    description: 'Tạo mã giảm giá cho đơn hàng',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
        <path d="M4 7h16" />
        <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
        <path d="M9 12h6" />
      </svg>
    ),
  },
  {
    id: 'hot',
    label: 'Khuyến mãi sốc',
    description: 'Giảm giá trực tiếp trên sản phẩm',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 14l6-6" />
        <circle cx="9.5" cy="8.5" r="1.5" />
        <circle cx="14.5" cy="13.5" r="1.5" />
        <path d="M3 21l6-6" />
        <path d="M15 3l6 6" />
      </svg>
    ),
  },
]

function formatDate(value) {
  if (!value) return '—'
  // Parse "2026-07-10T00:00:00" → "10/07/2026"
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.split('T')[0].split('-')
    return `${d}/${m}/${y}`
  }
  const date = new Date(value)
  if (isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function getHotDealPercent(product) {
  if (!product?.giaGoc || product.giaBan >= product.giaGoc) return null
  return Math.round((1 - product.giaBan / product.giaGoc) * 100)
}

export default function PromotionsPage() {
  const [tab, setTab] = useState('codes')
  const [vouchers, setVouchers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [voucherModal, setVoucherModal] = useState(undefined)
  const [voucherOpen, setVoucherOpen] = useState(false)
  const [hotProduct, setHotProduct] = useState(null)
  const [selectedVoucherIds, setSelectedVoucherIds] = useState([])
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(false)
  const debouncedSearch = useDebounce(search.trim(), 250)

  const fetchVouchers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getVouchers()
      setVouchers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      setVouchers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProducts({ page: 1, pageSize: 100, trangThai: true })
      setProducts(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'codes') fetchVouchers()
    else fetchProducts()
    setSearch('')
    setSelectedVoucherIds([])
  }, [tab, fetchVouchers, fetchProducts])

  const filteredVouchers = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return vouchers
    return vouchers.filter(
      (item) =>
        item.maCode?.toLowerCase().includes(q) || item.tenVoucher?.toLowerCase().includes(q),
    )
  }, [vouchers, debouncedSearch])

  const filteredProducts = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return products
    return products.filter((item) => item.tenSanPham?.toLowerCase().includes(q))
  }, [products, debouncedSearch])

  const visibleVoucherIds = useMemo(
    () => filteredVouchers.map((item) => item.maVoucher),
    [filteredVouchers],
  )

  const allVisibleVouchersSelected =
    visibleVoucherIds.length > 0 && visibleVoucherIds.every((id) => selectedVoucherIds.includes(id))

  useEffect(() => {
    setSelectedVoucherIds((prev) => prev.filter((id) => visibleVoucherIds.includes(id)))
  }, [visibleVoucherIds])

  function toggleVoucherSelect(id) {
    setSelectedVoucherIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  function toggleAllVisibleVouchers() {
    setSelectedVoucherIds((prev) => {
      if (allVisibleVouchersSelected) {
        return prev.filter((id) => !visibleVoucherIds.includes(id))
      }
      return [...new Set([...prev, ...visibleVoucherIds])]
    })
  }

  function openCreateVoucher() {
    setVoucherModal(undefined)
    setVoucherOpen(true)
  }

  function openEditVoucher(item) {
    setVoucherModal(item)
    setVoucherOpen(true)
  }

  async function handleVoucherSubmit(payload) {
    if (voucherModal) {
      await updateVoucher(voucherModal.maVoucher, payload)
      await showSuccess('Đã cập nhật mã khuyến mãi.')
    } else {
      await createVoucher(payload)
      await showSuccess('Đã tạo mã khuyến mãi.')
    }
    setVoucherOpen(false)
    await fetchVouchers()
  }

  async function handleDeleteVoucher(item) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa mã ${item.maCode}?`,
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    try {
      await deleteVoucher(item.maVoucher)
      await showSuccess('Đã xóa mã khuyến mãi.')
      setSelectedVoucherIds((prev) => prev.filter((id) => id !== item.maVoucher))
      await fetchVouchers()
    } catch (err) {
      await showError(err.message)
    }
  }

  async function handleDeleteSelectedVouchers() {
    if (selectedVoucherIds.length === 0) return

    const count = selectedVoucherIds.length
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Xóa ${count} mã khuyến mãi?`,
      text: 'Các mã đã chọn sẽ bị xóa vĩnh viễn.',
      confirmText: 'Xóa',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return

    setDeleting(true)
    try {
      for (const id of selectedVoucherIds) {
        await deleteVoucher(id)
      }
      setSelectedVoucherIds([])
      await fetchVouchers()
      await showSuccess(`Đã xóa ${count} mã khuyến mãi.`)
    } catch (err) {
      await showError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleHotDeal(percent) {
    if (!hotProduct) return

    try {
      await applyHotDeal(hotProduct.maSanPham, percent)
      await showSuccess(`Đã giảm ${percent}% cho ${hotProduct.tenSanPham}.`)
      setHotProduct(null)
      await fetchProducts()
    } catch (err) {
      await showError(err.message)
    }
  }

  async function handleRemoveHotDeal(product) {
    const confirmed = await confirmAction({
      icon: 'warning',
      title: `Gỡ giảm giá ${product.tenSanPham}?`,
      text: 'Giá bán sẽ trở về giá gốc.',
      confirmText: 'Gỡ giảm giá',
      cancelText: 'Giữ lại',
      confirmButtonColor: '#dc2626',
    })
    if (!confirmed) return false

    try {
      await removeHotDeal(product.maSanPham)
      await showSuccess(`Đã gỡ giảm giá ${product.tenSanPham}.`)
      setHotProduct(null)
      await fetchProducts()
      return true
    } catch (err) {
      await showError(err.message)
      return false
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-800">Khuyến mãi</h1>
          <p className="mt-1 text-sm text-gray-500">Tạo mã giảm giá hoặc giảm giá trực tiếp sản phẩm</p>
        </div>
        {tab === 'codes' && (
          <button
            type="button"
            onClick={openCreateVoucher}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            + Thêm mã khuyến mãi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tabs.map((item) => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={active}
              className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                active
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/15'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl transition ${
                  active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold ${active ? 'text-primary' : 'text-gray-800'}`}>
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{item.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-gray-500 shadow-sm">
          <IconSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === 'codes'
                ? 'Tìm mã, tên chương trình khuyến mãi...'
                : 'Tìm tên sản phẩm...'
            }
            className="w-full border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </div>

        {tab === 'codes' && selectedVoucherIds.length > 0 && (
          <AdminDeleteButton
            count={selectedVoucherIds.length}
            loading={deleting}
            onClick={handleDeleteSelectedVouchers}
          />
        )}
      </div>

      {tab === 'codes' ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleVouchersSelected}
                      onChange={toggleAllVisibleVouchers}
                      disabled={filteredVouchers.length === 0}
                      className="size-3.5 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary/30"
                      aria-label="Chọn tất cả mã hiển thị"
                    />
                  </th>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Tên chương trình</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Giá trị</th>
                  <th className="px-4 py-3">Đã dùng</th>
                  <th className="px-4 py-3">Hiệu lực</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                      {debouncedSearch
                        ? 'Không tìm thấy mã khuyến mãi.'
                        : 'Chưa có mã khuyến mãi. Bấm "Thêm mã khuyến mãi" để tạo.'}
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((item) => (
                    <tr key={item.maVoucher} className="hover:bg-gray-50/80">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedVoucherIds.includes(item.maVoucher)}
                          onChange={() => toggleVoucherSelect(item.maVoucher)}
                          className="size-3.5 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary/30"
                          aria-label={`Chọn ${item.maCode}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">{item.maCode}</td>
                      <td className="px-4 py-3">{item.tenVoucher}</td>
                      <td className="px-4 py-3">{item.loaiGiam === 'SoTien' ? 'Số tiền' : 'Phần trăm'}</td>
                      <td className="px-4 py-3">
                        {item.loaiGiam === 'SoTien' ? formatPrice(item.giaTri) : `${item.giaTri}%`}
                      </td>
                      <td className="px-4 py-3">
                        {item.daDung}
                        {item.soLuongToiDa ? ` / ${item.soLuongToiDa}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(item.ngayBatDau)} → {formatDate(item.ngayKetThuc)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.trangThai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.trangThai ? 'Đang bật' : 'Tắt'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <AdminTableActions
                            onEdit={() => openEditVoucher(item)}
                            onDelete={() => handleDeleteVoucher(item)}
                            editTitle="Sửa mã khuyến mãi"
                            deleteTitle="Xóa mã khuyến mãi"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Giá gốc</th>
                  <th className="px-4 py-3">Giá bán</th>
                  <th className="px-4 py-3">Giảm</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      {debouncedSearch ? 'Không tìm thấy sản phẩm.' : 'Chưa có sản phẩm.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const dealPercent = getHotDealPercent(product)
                    const hasDeal = dealPercent != null
                    return (
                      <tr key={product.maSanPham} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 font-medium text-gray-800">{product.tenSanPham}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {product.giaGoc ? formatPrice(product.giaGoc) : formatPrice(product.giaBan)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={hasDeal ? 'font-semibold text-red-600' : ''}>
                            {formatPrice(product.giaBan)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {hasDeal ? (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                              -{dealPercent}%
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <AdminTableActions
                              onEdit={() => setHotProduct(product)}
                              onDelete={hasDeal ? () => handleRemoveHotDeal(product) : undefined}
                              editTitle={hasDeal ? 'Chỉnh giảm giá' : 'Thiết lập giảm giá'}
                              deleteTitle="Gỡ giảm giá"
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <VoucherFormModal
        open={voucherOpen}
        voucher={voucherModal}
        onClose={() => setVoucherOpen(false)}
        onSubmit={handleVoucherSubmit}
      />

      <HotDealModal
        open={Boolean(hotProduct)}
        product={hotProduct}
        onClose={() => setHotProduct(null)}
        onSubmit={handleHotDeal}
        onRemove={() => handleRemoveHotDeal(hotProduct)}
      />
    </div>
  )
}
