import { useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../../../../lib/formatPrice'
import { getProductImageUrl } from '../../../../lib/productImage'
import { getProducts } from '../../../../services/productService'
import { buildComboMoTa, sumComboGiaLe } from '../productFormUtils'

export default function ComboItemsPicker({
  comboCategoryId,
  excludeProductId,
  selectedItems,
  onChange,
  onSuggestMoTa,
}) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getProducts({ page: 1, pageSize: 100, trangThai: true, sort: 'name' })
      .then((data) => {
        if (cancelled) return
        const items = (data.items ?? []).filter((p) => {
          if (comboCategoryId && p.maDanhMuc === comboCategoryId) return false
          if (excludeProductId && p.maSanPham === Number(excludeProductId)) return false
          return true
        })
        setCandidates(items)
      })
      .catch(() => {
        if (!cancelled) setCandidates([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [comboCategoryId, excludeProductId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(
      (p) =>
        p.tenSanPham?.toLowerCase().includes(q) ||
        p.tenDanhMuc?.toLowerCase().includes(q),
    )
  }, [candidates, search])

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((i) => i.maSanPhamCon)),
    [selectedItems],
  )

  function toggleProduct(product) {
    if (selectedIds.has(product.maSanPham)) {
      onChange(selectedItems.filter((i) => i.maSanPhamCon !== product.maSanPham))
      return
    }

    onChange([
      ...selectedItems,
      {
        maSanPhamCon: product.maSanPham,
        tenSanPham: product.tenSanPham,
        tenDanhMuc: product.tenDanhMuc,
        giaBan: product.giaBan,
        soLuong: 1,
      },
    ])
  }

  function updateQuantity(maSanPhamCon, soLuong) {
    const qty = Math.max(1, Number(soLuong) || 1)
    onChange(
      selectedItems.map((item) =>
        item.maSanPhamCon === maSanPhamCon ? { ...item, soLuong: qty } : item,
      ),
    )
  }

  function removeItem(maSanPhamCon) {
    onChange(selectedItems.filter((i) => i.maSanPhamCon !== maSanPhamCon))
  }

  const giaLe = sumComboGiaLe(selectedItems)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          Chọn ít nhất 2 món từ thực đơn hiện có. Giá lẻ gợi ý:{' '}
          <strong className="text-primary">{formatPrice(giaLe)}</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSuggestMoTa(buildComboMoTa(selectedItems))}
            disabled={selectedItems.length === 0}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Tạo mô tả từ món con
          </button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex flex-col gap-2 rounded-[10px] border border-primary/20 bg-primary-light/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Món trong combo</p>
          {selectedItems.map((item) => (
            <div
              key={item.maSanPhamCon}
              className="flex items-center gap-3 rounded-[10px] border border-white/80 bg-white px-3 py-2"
            >
              <img
                src={getProductImageUrl({
                  hinhAnhChinh: item.hinhAnhChinh,
                  tenSanPham: item.tenSanPham,
                  tenDanhMuc: item.tenDanhMuc,
                })}
                alt={item.tenSanPham}
                className="size-10 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{item.tenSanPham}</p>
                <p className="text-xs text-gray-500">{formatPrice(item.giaBan)}</p>
              </div>
              <input
                type="number"
                min="1"
                value={item.soLuong}
                onChange={(e) => updateQuantity(item.maSanPhamCon, e.target.value)}
                className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm"
                aria-label={`Số lượng ${item.tenSanPham}`}
              />
              <button
                type="button"
                onClick={() => removeItem(item.maSanPhamCon)}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Bỏ
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm món để thêm vào combo..."
        className="w-full rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
      />

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải danh sách món...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">Không có món phù hợp.</p>
      ) : (
        <div className="max-h-64 overflow-y-auto rounded-[10px] border border-gray-200">
          {filtered.map((product) => {
            const checked = selectedIds.has(product.maSanPham)
            return (
              <label
                key={product.maSanPham}
                className={`flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-none ${
                  checked ? 'bg-primary-light/50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleProduct(product)}
                  className="size-4 rounded border-gray-300 accent-primary"
                />
                <img
                  src={getProductImageUrl({
                    hinhAnhChinh: product.hinhAnhChinh,
                    tenSanPham: product.tenSanPham,
                    tenDanhMuc: product.tenDanhMuc,
                  })}
                  alt={product.tenSanPham}
                  className="size-9 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{product.tenSanPham}</p>
                  <p className="text-xs text-gray-500">{product.tenDanhMuc}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{formatPrice(product.giaBan)}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
