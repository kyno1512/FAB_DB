import { useState } from 'react'

export default function RevenueChart({ chart, loading = false, period = '7d' }) {
  if (loading) {
    return (
      <div className="rounded-[14px] bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="h-5 w-44 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-72 rounded bg-gray-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-16 rounded-lg bg-gray-200" />
            <div className="h-7 w-16 rounded-lg bg-gray-200" />
            <div className="h-7 w-16 rounded-lg bg-gray-200" />
          </div>
        </div>
        <div className="h-72 w-full rounded-xl bg-gray-100" />
      </div>
    )
  }

  if (!chart?.hasData) {
    return (
      <div className="rounded-[14px] bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="font-semibold">Phân tích doanh thu</h3>
          <p className="mt-1 text-[0.82rem] text-gray-500">
            {period === '12m' ? '12 tháng' : period === '30d' ? '30 ngày' : '7 ngày'} gần nhất · dữ liệu từ đơn hàng
          </p>
        </div>
        <p className="py-16 text-center text-sm text-gray-500">
          Chưa có doanh thu trong kỳ này.
          <br />
          Khi có đơn hàng, biểu đồ sẽ hiện số tiền thật.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[14px] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Phân tích doanh thu</h3>
          <p className="mt-1 text-[0.82rem] text-gray-500">
            {period === '12m' ? '12 tháng' : period === '30d' ? '30 ngày' : '7 ngày'} gần nhất · số tiền thật từ đơn hàng
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Doanh thu
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d1d5db]" />
            Đơn hàng
          </span>
        </div>
      </div>

      <RevenueAreaChart points={chart.areaPoints ?? chart.dailyBars} />
    </div>
  )
}

function RevenueAreaChart({ points = [] }) {
  const width = 640
  const height = 300
  const padding = { top: 20, right: 24, bottom: 56, left: 64 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const [activeIndex, setActiveIndex] = useState(-1)

  const values = points.map((p) => Number(p.value) || 0)
  const max = Math.max(...values, 1)
  const step = points.length <= 1 ? 0 : innerWidth / (points.length - 1)

  const mapX = (index) => padding.left + step * index
  const mapY = (value) => padding.top + innerHeight - (value / max) * innerHeight

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${mapX(index).toFixed(2)} ${mapY(Number(point.value) || 0).toFixed(2)}`)
    .join(' ')

  const area = `${line} L ${mapX(points.length - 1).toFixed(2)} ${padding.top + innerHeight} L ${mapX(0).toFixed(2)} ${padding.top + innerHeight} Z`

  const niceMax = niceRound(max)
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  const formatValue = (value) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`
    return String(value)
  }

  const formatFullValue = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const labelEvery = pickLabelEvery(points.length)

  const tooltip = activeIndex >= 0 && activeIndex < points.length ? points[activeIndex] : null
  const rawTooltipX = tooltip ? mapX(activeIndex) : padding.left
  const rawTooltipY = tooltip ? mapY(Number(tooltip.value) || 0) : padding.top
  const tooltipBoxWidth = 156
  const tooltipBoxHeight = 48
  const tooltipGap = 10
  const tooltipLeft = rawTooltipX + tooltipGap + tooltipBoxWidth > width ? rawTooltipX - tooltipGap - tooltipBoxWidth : rawTooltipX + tooltipGap
  const tooltipY = Math.max(padding.top, rawTooltipY - tooltipBoxHeight - tooltipGap)
  const tooltipVisible = !!tooltip && tooltipLeft >= padding.left && tooltipLeft + tooltipBoxWidth <= width - padding.right

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setActiveIndex(-1)}
      >
        <defs>
          <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6FB9A7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6FB9A7" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const value = tick * niceMax
          const y = padding.top + innerHeight - tick * innerHeight
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#f3f4f6" />
              <text x={padding.left - 10} y={y + 3} textAnchor="end" className="fill-gray-400 text-[11px]">
                {formatValue(value)}
              </text>
            </g>
          )
        })}

        <path d={area} fill="url(#revenueAreaGradient)" />
        <rect
          x={padding.left}
          y={padding.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          onMouseMove={(event) => {
            const svg = event.currentTarget.ownerSVGElement
            if (!svg) return
            const rect = svg.getBoundingClientRect()
            const mouseX = ((event.clientX - rect.left) / rect.width) * width
            let index = Math.round((mouseX - padding.left) / step)
            if (index < 0) index = 0
            if (index >= points.length) index = points.length - 1
            setActiveIndex(index)
          }}
        />
        <path
          d={line}
          fill="none"
          stroke="#6FB9A7"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => {
          const x = mapX(index)
          const y = mapY(Number(point.value) || 0)
          const isActive = activeIndex === index
          const showLabel = index % labelEvery === 0
          return (
            <g
              key={point.label}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={x}
                cy={y}
                r={isActive ? 7 : 4.5}
                fill="#ffffff"
                stroke="#6FB9A7"
                strokeWidth={isActive ? 3 : 2}
              />
              {showLabel ? (
                <text
                  x={x}
                  y={height - 14}
                  textAnchor="middle"
                  className="fill-gray-500 text-[11px]"
                  transform={points.length > 14 ? `rotate(-45, ${x}, ${height - 14})` : undefined}
                >
                  {point.label}
                </text>
              ) : null}
            </g>
          )
        })}

        {tooltipVisible && (
          <g pointerEvents="none">
            <line
              x1={rawTooltipX}
              x2={rawTooltipX}
              y1={padding.top}
              y2={padding.top + innerHeight}
              stroke="#9ca3af"
              strokeDasharray="3 3"
            />
            <rect
              x={tooltipLeft}
              y={tooltipY}
              width={tooltipBoxWidth}
              height={tooltipBoxHeight}
              rx={10}
              fill="#111827"
              opacity={0.95}
            />
            <text x={tooltipLeft + 12} y={tooltipY + 18} className="fill-gray-100 text-[11px]">
              {tooltip.label}
            </text>
            <text x={tooltipLeft + 12} y={tooltipY + 30} className="fill-emerald-200 text-[11px]">
              {formatFullValue(Number(tooltip.value) || 0)}
            </text>
            <text x={tooltipLeft + 12} y={tooltipY + 42} className="fill-gray-200 text-[11px]">
              {tooltip.orders ?? 0} đơn hàng
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

function pickLabelEvery(count) {
  if (count <= 7) return 1
  if (count <= 14) return 2
  if (count <= 21) return 3
  return 4
}

function niceRound(value) {
  if (value <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalized = value / magnitude
  let niceNormalized
  if (normalized <= 1) niceNormalized = 1
  else if (normalized <= 2) niceNormalized = 2
  else if (normalized <= 5) niceNormalized = 5
  else niceNormalized = 10
  return niceNormalized * magnitude
}
