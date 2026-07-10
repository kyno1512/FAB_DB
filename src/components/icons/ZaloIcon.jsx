export default function ZaloIcon({ size = 20, className = '' }) {
  return (
    <img
      src="/icons/zalo.svg"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-md ${className}`.trim()}
      aria-hidden
    />
  )
}
