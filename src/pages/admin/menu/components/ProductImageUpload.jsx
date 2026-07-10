import { useRef, useState } from 'react'
import { inputField } from '../../../../lib/classes'
import { uploadProductImage } from '../../../../services/uploadService'
import { IconUpload } from './form/formIcons'

const fieldClass = `${inputField} w-full bg-white text-gray-800`
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500'

export default function ProductImageUpload({ value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const data = await uploadProductImage(file)
      if (data?.url) onChange(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function openPicker() {
    if (!uploading) inputRef.current?.click()
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className={`relative flex w-full min-h-[200px] flex-col items-center justify-center rounded-[10px] border-2 border-dashed p-6 transition disabled:cursor-wait disabled:opacity-70 ${
          value ? 'border-primary/40 bg-primary-light/30' : 'border-gray-200 bg-gray-50 hover:border-primary/30 hover:bg-primary-light/20'
        }`}
      >
        {value ? (
          <img
            src={value}
            alt="Preview"
            className="mb-4 max-h-36 rounded-[10px] object-cover shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span className="mb-3 text-primary/60">
            <IconUpload />
          </span>
        )}
        <p className="text-center text-sm font-medium text-gray-700">
          {uploading ? 'Đang tải ảnh...' : 'Bấm để chọn ảnh từ máy'}
        </p>
        <p className="mt-1 text-center text-xs text-gray-400">
          JPG, PNG, WEBP, GIF · 1080×1080px · Tối đa 5MB
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">hoặc dán URL</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <label className="block">
        <span className={labelClass}>URL hình ảnh</span>
        <input
          className={fieldClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/... hoặc /uploads/products/..."
        />
      </label>

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="mt-3 text-xs font-medium text-red-500 hover:text-red-600"
        >
          Xóa ảnh
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
