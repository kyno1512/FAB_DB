import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { formatPrice } from '../../../lib/formatPrice'
import { inputField } from '../../../lib/classes'
import { paths } from '../../../routes/paths'
import { getCategories } from '../../../services/categoryService'
import { createProduct, getProductById, updateProduct } from '../../../services/productService'
import FormCard from './components/form/FormCard'
import ComboItemsPicker from './components/ComboItemsPicker'
import BomItemsPicker from './components/BomItemsPicker'
import ProductImageUpload from './components/ProductImageUpload'
import { IconImage, IconInfo, IconPrice, IconSettings, IconSparkle } from './components/form/formIcons'
import {
  comboItemsFromProduct,
  bomItemsFromProduct,
  emptyForm,
  getComboCategoryId,
  isComboCategory,
  toPayload,
  sumComboGiaLe,
} from './productFormUtils'

const fieldClass = `${inputField} w-full bg-white text-gray-800`
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function ProductFormPage({ comboMode = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [selectedComboItems, setSelectedComboItems] = useState([])
  const [selectedBomItems, setSelectedBomItems] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return

    setLoading(true)
    getProductById(id)
      .then((p) => {
        setForm({
          maDanhMuc: String(p.maDanhMuc),
          tenSanPham: p.tenSanPham ?? '',
          moTa: p.moTa ?? '',
          giaBan: String(p.giaBan ?? ''),
          giaGoc: p.giaGoc != null ? String(p.giaGoc) : '',
          donVi: p.donVi ?? 'Ly',
          trangThai: p.trangThai ?? true,
          hinhAnhUrl: p.hinhAnhs?.[0]?.duongDan ?? '',
        })
        setSelectedComboItems(comboItemsFromProduct(p))
        setSelectedBomItems(bomItemsFromProduct(p))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  useEffect(() => {
    if (isEdit || categories.length === 0) return
    if (comboMode) {
      const comboId = getComboCategoryId(categories)
      if (comboId) {
        setForm((prev) => ({
          ...prev,
          maDanhMuc: String(comboId),
          donVi: 'Set',
        }))
      }
      return
    }
    setForm((prev) =>
      prev.maDanhMuc ? prev : { ...prev, maDanhMuc: String(categories[0].maDanhMuc) },
    )
  }, [categories, isEdit, comboMode])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const comboCategoryId = getComboCategoryId(categories)
  const showComboPicker = comboMode || isComboCategory(categories, form.maDanhMuc)
  const formTitle = isEdit
    ? showComboPicker
      ? 'Cập nhật combo'
      : 'Cập nhật sản phẩm'
    : comboMode
      ? 'Tạo combo mới'
      : 'Tạo sản phẩm mới'
  const formSubtitle = isEdit
    ? showComboPicker
      ? 'Chỉnh sửa thông tin combo và các món con.'
      : 'Chỉnh sửa thông tin món trên thực đơn.'
    : comboMode
      ? 'Gộp các món có sẵn thành combo tiết kiệm.'
      : 'Thêm món mới vào thực đơn Flygo.'

  const comboGiaLe = sumComboGiaLe(selectedComboItems)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.tenSanPham.trim()) return setError('Tên sản phẩm không được để trống.')
    if (!form.maDanhMuc) return setError('Vui lòng chọn danh mục.')
    if (!form.giaBan || Number(form.giaBan) <= 0) return setError('Giá bán phải lớn hơn 0.')
    if (showComboPicker && selectedComboItems.length < 2) {
      return setError('Combo cần chọn ít nhất 2 món con.')
    }

    setSaving(true)
    try {
      const payload = toPayload(form, selectedComboItems, selectedBomItems)
      if (isEdit) await updateProduct(id, payload)
      else await createProduct(payload)
      navigate(paths.ADMIN_MENU)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Đang tải sản phẩm...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit}>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-800">{formTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">{formSubtitle}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(paths.ADMIN_MENU)}
              className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : showComboPicker ? 'Lưu combo' : 'Lưu sản phẩm'}
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <FormCard icon={<IconInfo />} title="Thông tin chung">
            <label className="mb-4 block">
              <span className={labelClass}>Tên sản phẩm</span>
              <input
                className={fieldClass}
                value={form.tenSanPham}
                onChange={(e) => updateField('tenSanPham', e.target.value)}
                placeholder={showComboPicker ? 'Ví dụ: Combo Sáng Flygo' : 'Ví dụ: Bánh Tiramisu Cao Cấp'}
              />
            </label>

            <label className="mb-4 block">
              <div className="mb-2 flex items-center justify-between">
                <span className={labelClass}>Mô tả sản phẩm</span>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-light px-2.5 py-1 text-xs font-medium text-primary"
                >
                  <IconSparkle /> AI Viết nội dung
                </button>
              </div>
              <textarea
                className={`${fieldClass} min-h-[120px] resize-y`}
                value={form.moTa}
                onChange={(e) => updateField('moTa', e.target.value)}
                placeholder={
                  showComboPicker
                    ? 'Mô tả combo: gồm những món gì, dùng lúc nào, lợi ích tiết kiệm...'
                    : 'Mô tả chi tiết: hương vị, nguyên liệu, size, cách dùng, điểm nổi bật...'
                }
              />
            </label>

            <label className="block">
              <span className={labelClass}>Danh mục</span>
              <select
                className={fieldClass}
                value={form.maDanhMuc}
                onChange={(e) => updateField('maDanhMuc', e.target.value)}
                disabled={comboMode && !isEdit}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
                    {cat.tenDanhMuc}
                  </option>
                ))}
              </select>
              {showComboPicker && (
                <p className="mt-2 text-xs text-primary">
                  Danh mục Combo — chọn các món con ở khung bên dưới.
                </p>
              )}
            </label>
          </FormCard>

          <FormCard icon={<IconImage />} title="Hình ảnh">
            <ProductImageUpload
              value={form.hinhAnhUrl}
              onChange={(url) => updateField('hinhAnhUrl', url)}
            />
          </FormCard>

          {showComboPicker && (
            <FormCard icon={<IconSettings />} title="Món trong combo">
              <ComboItemsPicker
                comboCategoryId={comboCategoryId}
                excludeProductId={isEdit ? id : null}
                selectedItems={selectedComboItems}
                onChange={setSelectedComboItems}
                onSuggestMoTa={(text) => updateField('moTa', text)}
              />
            </FormCard>
          )}

          {!showComboPicker && (
            <FormCard icon={<IconSettings />} title="Công thức nguyên liệu">
              <BomItemsPicker
                selectedItems={selectedBomItems}
                onChange={setSelectedBomItems}
              />
            </FormCard>
          )}

          <FormCard icon={<IconPrice />} title={showComboPicker ? 'Giá combo' : 'Giá bán'}>
            <label className="mb-6 block">
              <span className={labelClass}>
                {showComboPicker ? 'Giá combo (VND)' : 'Giá bán (VND)'}
              </span>
              <input
                type="number"
                min="0"
                className={fieldClass}
                value={form.giaBan}
                onChange={(e) => updateField('giaBan', e.target.value)}
                placeholder={showComboPicker ? '75000' : '85000'}
              />
              {showComboPicker && selectedComboItems.length >= 2 && comboGiaLe > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Mua lẻ các món: <strong className="text-gray-700">{formatPrice(comboGiaLe)}</strong>
                  {comboGiaLe > Number(form.giaBan) && Number(form.giaBan) > 0 && (
                    <>
                      {' '}
                      — tiết kiệm{' '}
                      <strong className="text-primary">
                        {formatPrice(comboGiaLe - Number(form.giaBan))}
                      </strong>{' '}
                      trên app
                    </>
                  )}
                </p>
              )}
            </label>

            <label className="mb-6 block">
              <span className={labelClass}>Đơn vị bán</span>
              <input
                className={fieldClass}
                value={form.donVi}
                onChange={(e) => updateField('donVi', e.target.value)}
                placeholder="Ly, Phần, Cái..."
              />
            </label>

            <div className="flex items-center justify-between rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Trạng thái sẵn sàng</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {form.trangThai ? 'Sản phẩm đang hiển thị trên menu' : 'Sản phẩm tạm ngưng bán'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.trangThai}
                onClick={() => updateField('trangThai', !form.trangThai)}
                className={`relative h-7 w-12 rounded-full transition ${
                  form.trangThai ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition ${
                    form.trangThai ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </FormCard>
        </div>
      </form>
    </div>
  )
}
