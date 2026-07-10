const ICONS = {
  slips: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h6" strokeLinecap="round" />
    </svg>
  ),
  value: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 16h2" strokeLinecap="round" />
    </svg>
  ),
  pending: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  ),
  done: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const TONE_CLASS = {
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  orange: 'bg-orange-50 text-orange-600',
  green: 'bg-emerald-50 text-emerald-600',
}

export default function InventoryTransactionStatCards({ stats, onExportExcel }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.highlight ? 'text-orange-500' : 'text-gray-800'}`}>
              {stat.value}
            </p>
            {stat.exportable && onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v12M8 11l4 4 4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Xuất Excel
              </button>
            )}
          </div>
          <div
            className={`ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TONE_CLASS[stat.tone] || TONE_CLASS.blue}`}
          >
            {ICONS[stat.icon] || ICONS.slips}
          </div>
        </div>
      ))}
    </div>
  )
}
