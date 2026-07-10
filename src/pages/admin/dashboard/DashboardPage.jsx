import StatCards from './components/StatCards'
import RevenueChart from './components/RevenueChart'
import AiSuggestions from './components/AiSuggestions'
import RecentOrders from './components/RecentOrders'
import BestSellers from './components/BestSellers'
import { useDashboardData } from '../../../hooks/useDashboardData'

export default function DashboardPage() {
  const { data, loading, error, reload, period, setPeriod, presets } = useDashboardData()

  return (
    <>
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="rounded-full border border-red-300 bg-white px-4 py-1.5 font-semibold text-red-600 hover:bg-red-50"
          >
            Thử lại
          </button>
        </div>
      )}

      {!error && data?.periodLabel && !loading && (
        <p className="text-sm text-gray-500">Dữ liệu {data.periodLabel}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm">
        {presets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => setPeriod(preset.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              period === preset.key
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <StatCards items={data?.statCards} loading={loading} />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <RevenueChart chart={data?.revenueChart} loading={loading} period={period} />
        <AiSuggestions items={data?.aiSuggestions} loading={loading} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <RecentOrders orders={data?.recentOrders} loading={loading} />
        <BestSellers items={data?.bestSellers} loading={loading} />
      </div>
    </>
  )
}
