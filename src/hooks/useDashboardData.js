import { useCallback, useEffect, useState } from 'react'
import { buildDashboardViewModel, getDashboardDateRanges } from '../lib/dashboardData'
import { getReportsOverview } from '../services/reportAdminService'
import { getAdminOrders } from '../services/orderAdminService'

const PERIOD_PRESETS = [
  { key: '7d', label: '7 ngày', days: 6, groupBy: 'day' },
  { key: '30d', label: '30 ngày', days: 29, groupBy: 'day' },
  { key: '12m', label: '12 tháng', months: 11, groupBy: 'month' },
]

export function useDashboardData() {
  const [period, setPeriod] = useState(PERIOD_PRESETS[0].key)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const preset = PERIOD_PRESETS.find((p) => p.key === period) ?? PERIOD_PRESETS[0]

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { to } = getDashboardDateRanges()

      const start = new Date(to)
      if (period === '12m') {
        start.setMonth(start.getMonth() - preset.months)
        start.setHours(0, 0, 0, 0)
      } else {
        start.setDate(start.getDate() - preset.days)
        start.setHours(0, 0, 0, 0)
      }

      const fromStr = start.toISOString().slice(0, 10)
      const [current, orders] = await Promise.all([
        getReportsOverview({ from: fromStr, to, groupBy: preset.groupBy }),
        getAdminOrders(),
      ])

      setData(buildDashboardViewModel({
        current,
        previous: null,
        weekReport: current,
        orders: Array.isArray(orders) ? orders : [],
        periodLabel:
          preset.groupBy === 'month'
            ? `${start.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })} – ${new Date(to).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}`
            : `${start.toLocaleDateString('vi-VN')} – ${new Date(to).toLocaleDateString('vi-VN')}`,
        period,
      }))
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [preset, period])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load, period, setPeriod, presets: PERIOD_PRESETS }
}
