import { useNavigate } from 'react-router-dom'
import { btnPrimary } from '../../../../lib/classes'
import { aiSuggestions as fallbackSuggestions } from '../../../../data/adminData'
import { paths } from '../../../../routes/paths'

const typeStyles = {
  warning: 'border-l-red-500 bg-red-50 [&_strong]:text-red-600',
  forecast: 'border-l-blue-500 bg-blue-50 [&_strong]:text-blue-600',
  tip: 'border-l-slate-400 bg-gray-50 [&_strong]:text-slate-600',
}

export default function AiSuggestions({ items = [], loading = false }) {
  const navigate = useNavigate()
  const suggestions = items.length > 0 ? items : fallbackSuggestions

  if (loading) {
    return (
      <div className="animate-pulse rounded-[14px] bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-[10px] bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-[14px] bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold">Trung tâm Gợi ý </h3>
      <div className="mb-4 flex flex-1 flex-col gap-3">
        {suggestions.map((item) => (
          <div
            key={item.title}
            className={`rounded-[10px] border-l-[3px] p-3.5 ${typeStyles[item.type]}`}
          >
            <strong className="block text-[0.88rem]">{item.title}</strong>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={btnPrimary}
        onClick={() => navigate(paths.ADMIN_REPORTS)}
      >
        Xem Dự Báo Chi Tiết
      </button>
    </div>
  )
}
