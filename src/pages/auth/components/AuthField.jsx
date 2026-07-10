import { useState } from 'react'
import { IconEye } from './authIcons'

export default function AuthField({
  label,
  icon,
  type = 'text',
  className = '',
  togglePassword = false,
  ...props
}) {
  const [show, setShow] = useState(false)
  const inputType = togglePassword ? (show ? 'text' : 'password') : type

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-white/75">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          type={inputType}
          className={`w-full rounded-xl border-0 bg-white py-3.5 pl-11 pr-11 text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-primary/40 ${className}`}
          {...props}
        />
        {togglePassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            <IconEye open={show} />
          </button>
        )}
      </div>
    </label>
  )
}
