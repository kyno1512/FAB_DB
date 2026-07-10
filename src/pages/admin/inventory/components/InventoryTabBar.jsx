const TABS = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'materials', label: 'Nguyên liệu' },
  { id: 'transactions', label: 'Nhập / Xuất' },
  { id: 'history', label: 'Lịch sử' },
]

export default function InventoryTabBar({ active, onChange }) {
  return (
    <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-3 sm:px-6">
      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-gray-100/90 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              active === tab.id
                ? 'bg-white text-primary shadow-sm ring-1 ring-black/[0.04]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export { TABS }
