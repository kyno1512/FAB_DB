import { useEffect, useState } from 'react'
import NewsImageUpload from './NewsImageUpload'

const EMPTY = {
  tieuDe: '',
  danhMuc: '',
  tomTat: '',
  noiDung: '',
  anhDaiDien: '',
  trangThai: 'Nhap',
  ngayDang: '',
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

function todayVnDate() {
  const now = new Date()
  return `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`
}

function isoToVnDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.slice(0, 10).split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

function vnDateToIso(vn) {
  const trimmed = vn.trim()
  if (!trimmed) return null

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null

  const day = pad2(Number(match[1]))
  const month = pad2(Number(match[2]))
  const year = Number(match[3])
  const date = new Date(year, Number(month) - 1, Number(day), 12, 0, 0)

  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== Number(month) ||
    date.getDate() !== Number(day)
  ) {
    return null
  }

  return `${year}-${month}-${day}`
}

function buildImagesFromPost(post) {
  if (!post) return []
  const images = []
  if (post.anhDaiDien) images.push(post.anhDaiDien)
  if (Array.isArray(post.anhPhu)) images.push(...post.anhPhu.filter(Boolean))
  return images
}

export default function NewsFormModal({ open, post, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [images, setImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    if (post) {
      setForm({
        tieuDe: post.tieuDe ?? '',
        danhMuc: post.danhMuc ?? '',
        tomTat: post.tomTat ?? '',
        noiDung: post.noiDung ?? '',
        anhDaiDien: post.anhDaiDien ?? '',
        trangThai: post.trangThai ?? 'Nhap',
        ngayDang: post.ngayDang ? isoToVnDate(post.ngayDang) : todayVnDate(),
      })
      setImages(buildImagesFromPost(post))
    } else {
      setForm({ ...EMPTY, ngayDang: todayVnDate() })
      setImages([])
    }
  }, [open, post])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const cover = images[0] ?? (form.anhDaiDien.trim() || null)
      const extras = images.length > 1 ? images.slice(1) : null
      const ngayIso = vnDateToIso(form.ngayDang)

      if (form.ngayDang.trim() && !ngayIso) {
        setError('Ngày đăng không hợp lệ. Nhập theo dd/mm/yyyy.')
        return
      }

      await onSubmit({
        tieuDe: form.tieuDe.trim(),
        danhMuc: form.danhMuc.trim(),
        tomTat: form.tomTat.trim(),
        noiDung: form.noiDung.trim() || null,
        anhDaiDien: cover,
        anhPhu: extras,
        trangThai: form.trangThai,
        ngayDang: ngayIso ? new Date(`${ngayIso}T12:00:00`).toISOString() : null,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="font-display text-xl font-semibold text-gray-800">
            {post ? 'Sửa bài viết' : 'Viết bài mới'}
          </h3>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-6 py-5">
          <Field label="Tiêu đề">
            <input
              required
              value={form.tieuDe}
              onChange={(e) => setForm({ ...form, tieuDe: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Danh mục">
              <input
                required
                spellCheck={false}
                value={form.danhMuc}
                onChange={(e) => setForm({ ...form, danhMuc: e.target.value })}
                placeholder="Nhập danh mục, VD: Tin tức, Bánh ngọt..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="Trạng thái">
              <label className="flex min-h-[42px] cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 transition hover:border-primary/30">
                <input
                  type="checkbox"
                  checked={form.trangThai === 'DangDang'}
                  onChange={(e) =>
                    setForm({ ...form, trangThai: e.target.checked ? 'DangDang' : 'Nhap' })
                  }
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  {form.trangThai === 'DangDang' ? 'Đang đăng — hiển thị trên trang tin tức' : 'Nháp — chỉ lưu trong admin'}
                </span>
              </label>
            </Field>
          </div>

          <Field label="Tóm tắt">
            <textarea
              required
              rows={3}
              value={form.tomTat}
              onChange={(e) => setForm({ ...form, tomTat: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="Nội dung (tuỳ chọn)">
            <textarea
              rows={5}
              value={form.noiDung}
              onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="Hình ảnh">
            <NewsImageUpload images={images} onChange={setImages} />
          </Field>

          <Field label="Hoặc dán URL ảnh bìa">
            <input
              value={form.anhDaiDien}
              onChange={(e) => {
                const url = e.target.value
                setForm({ ...form, anhDaiDien: url })
                if (url.trim()) {
                  const rest = images.slice(1)
                  setImages([url.trim(), ...rest.filter((item) => item !== url.trim())])
                }
              }}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="Ngày đăng">
            <input
              spellCheck={false}
              value={form.ngayDang}
              onChange={(e) => setForm({ ...form, ngayDang: e.target.value })}
              placeholder="dd/mm/yyyy"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>
        </div>

        {error && <p className="px-6 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : post ? 'Lưu thay đổi' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      {children}
    </label>
  )
}
