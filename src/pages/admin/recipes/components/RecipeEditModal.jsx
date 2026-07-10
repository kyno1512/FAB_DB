import { useEffect, useState } from 'react'
import BomItemsPicker from '../../menu/components/BomItemsPicker'
import { bomItemsFromProduct } from '../../menu/productFormUtils'
import { getRecipeByProductId, updateRecipe } from '../../../../services/recipeAdminService'

export default function RecipeEditModal({ product, onClose, onSave }) {
  const isNew = !product?.maSanPham
  const [selectedBomItems, setSelectedBomItems] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    setLoading(true)
    setError('')

    getRecipeByProductId(product.maSanPham)
      .then((detail) => {
        if (!cancelled) setSelectedBomItems(bomItemsFromProduct(detail))
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [product?.maSanPham, isNew])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const bomItems = selectedBomItems
        .filter((item) => item.maNguyenLieu > 0 && item.soLuong > 0)
        .map((item) => ({
          maNguyenLieu: item.maNguyenLieu,
          soLuong: item.soLuong,
          donVi: item.donVi?.trim() || 'kg',
          ghiChu: item.ghiChu?.trim() || null,
        }))

      await updateRecipe(product.maSanPham, { bomItems })
      await onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-800">Công thức nguyên liệu</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {product.tenSanPham} · {product.tenDanhMuc}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-500">Đang tải công thức...</p>
          ) : (
            <BomItemsPicker selectedItems={selectedBomItems} onChange={setSelectedBomItems} />
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu công thức'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
