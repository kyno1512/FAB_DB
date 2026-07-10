import { inputField } from '../../lib/classes'

export default function Input({ className = '', ...props }) {
  return <input className={`${inputField} ${className}`.trim()} {...props} />
}
