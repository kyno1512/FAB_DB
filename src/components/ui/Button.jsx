import { btnPrimary } from '../../lib/classes'

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = variant === 'primary' ? btnPrimary : className
  return (
    <button type="button" className={`${base} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
