export default function StockBadge({ conHang, coTheBan, className = '' }) {
  // Chỉ hiển thị badge khi hết hàng
  if (conHang) return null

  const text = coTheBan === 0 ? 'Hết hàng' : `Còn ${coTheBan} phần`

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ${className}`}>
      <span className="size-1.5 rounded-full bg-red-500" />
      {text}
    </span>
  )
}
