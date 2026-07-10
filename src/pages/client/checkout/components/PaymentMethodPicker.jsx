import { PAYMENT_OPTIONS } from '../../../../constants/payment'

function IconCod() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7V10z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  )
}

function IconCard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}

const icons = {
  cod: <IconCod />,
  card: <IconCard />,
}

export default function PaymentMethodPicker({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PAYMENT_OPTIONS.map((opt) => {
        const selected = value === opt.id
        return (
          <label
            key={opt.id}
            className={`relative cursor-pointer rounded-2xl border-2 p-4 transition ${
              selected
                ? 'border-primary bg-primary-light shadow-sm'
                : 'border-cream-dark bg-white hover:border-primary/40'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={opt.id}
              checked={selected}
              onChange={() => onChange(opt.id)}
              className="sr-only"
            />
            <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
              {opt.badge}
            </span>
            <div className={`mb-3 grid size-11 place-items-center rounded-xl ${selected ? 'bg-primary text-white' : 'bg-cream text-primary'}`}>
              {icons[opt.id]}
            </div>
            <p className="pr-14 text-sm font-semibold text-gray-800">{opt.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{opt.desc}</p>
          </label>
        )
      })}
    </div>
  )
}
