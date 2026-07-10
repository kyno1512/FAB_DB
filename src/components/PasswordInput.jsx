import { useState } from 'react'
import { IconEye } from '../pages/auth/components/authIcons'

const defaultClass =
  'w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

export default function PasswordInput({ className = defaultClass, style, ...props }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type="text"
        className={className}
        style={{
          ...style,
          ...(show ? {} : { WebkitTextSecurity: 'disc' }),
        }}
        autoComplete={props.autoComplete ?? 'off'}
      />
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setShow((value) => !value)
        }}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        <IconEye open={show} />
      </button>
    </div>
  )
}
