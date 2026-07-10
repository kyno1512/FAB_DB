import { useRef, useState } from 'react'
import { uploadNewsImages } from '../../../../services/uploadService'

const MAX_IMAGES = 10

export default function NewsImageUpload({ images, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const picked = Array.from(e.target.files ?? [])
    if (picked.length === 0) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      setError(`Tối đa ${MAX_IMAGES} ảnh mỗi bài viết.`)
      e.target.value = ''
      return
    }

    const files = picked.slice(0, remaining)
    setUploading(true)
    setError('')

    try {
      const data = await uploadNewsImages(files)
      const urls = Array.isArray(data?.urls) ? data.urls : []
      onChange([...images, ...urls])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeAt(index) {
    onChange(images.filter((_, i) => i !== index))
  }

  function setCover(index) {
    if (index === 0) return
    const next = [...images]
    const [cover] = next.splice(index, 1)
    next.unshift(cover)
    onChange(next)
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= MAX_IMAGES}
          className="rounded-xl border border-primary/30 bg-primary-light px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? 'Đang tải...' : 'Chọn ảnh từ máy'}
        </button>
        <span className="text-xs text-gray-500">
          JPG, PNG, WEBP, GIF · tối đa 5MB/ảnh · {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Ảnh bìa
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/55 p-2 opacity-0 transition group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => setCover(index)}
                    className="flex-1 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-gray-800"
                  >
                    Đặt bìa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="rounded-lg bg-red-500 px-2 py-1 text-[11px] font-semibold text-white"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          Chưa có ảnh. Bạn có thể tải 1 hoặc nhiều ảnh, hoặc dán URL bên dưới.
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
