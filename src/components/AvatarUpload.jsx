import { useRef, useState } from 'react'
import { uploadAvatar } from '../services/uploadService'

function getInitial(name) {
  const text = name?.trim()
  return text ? text.charAt(0).toUpperCase() : '?'
}

export default function AvatarUpload({ value, onChange, userName = '' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const data = await uploadAvatar(file)
      onChange(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <p className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        Ảnh đại diện
      </p>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group relative size-24 overflow-hidden rounded-2xl border-2 border-dashed border-cream-dark bg-cream/40 transition hover:border-primary hover:bg-primary/5 disabled:opacity-60"
        >
          {value ? (
            <img src={value} alt="Ảnh đại diện" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-2xl font-bold text-primary">
              {getInitial(userName)}
            </span>
          )}

          <span className="absolute inset-0 grid place-items-center bg-black/40 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
            {uploading ? 'Đang tải...' : 'Chọn ảnh'}
          </span>
        </button>

        <div className="text-sm text-gray-500">
          <p>Bấm vào khung ảnh để tải lên từ máy.</p>
          <p className="mt-1 text-xs text-gray-400">JPG, PNG, WEBP, GIF · tối đa 5MB</p>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="mt-2 text-xs font-medium text-red-500 hover:underline"
            >
              Xóa ảnh
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
