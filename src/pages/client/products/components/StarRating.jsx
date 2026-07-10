import { useState } from 'react'

const sizeMap = {
  sm: 18,
  md: 24,
  lg: 32,
  xl: 40,
}

function StarIcon({ filled, size, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 transition-all duration-150 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 2.5l2.47 5.01 5.53.8-4 3.9.94 5.5L12 15.9l-4.94 2.81.94-5.5-4-3.9 5.53-.8L12 2.5z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StarRating({
  value = 0,
  max = 5,
  size = 'md',
  onChange,
  className = '',
}) {
  const [hover, setHover] = useState(0)
  const pixelSize = sizeMap[size] ?? sizeMap.md
  const interactive = typeof onChange === 'function'
  const displayValue = interactive && hover > 0 ? hover : value

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      onMouseLeave={interactive ? () => setHover(0) : undefined}
    >
      {Array.from({ length: max }, (_, index) => {
        const star = index + 1
        const active = displayValue > 0 && star <= displayValue

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              className={`rounded p-0.5 transition-transform hover:scale-110 ${
                active ? 'text-amber-400' : 'text-gray-200 hover:text-amber-300'
              }`}
              aria-label={`${star} sao`}
            >
              <StarIcon filled={active} size={pixelSize} />
            </button>
          )
        }

        return (
          <span
            key={star}
            className={active ? 'text-amber-400' : 'text-gray-200'}
            aria-hidden="true"
          >
            <StarIcon filled={active} size={pixelSize} />
          </span>
        )
      })}
    </div>
  )
}
