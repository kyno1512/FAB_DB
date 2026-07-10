import { DELIVERY } from '../../../../constants/store'

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.6 3.5A2 2 0 0 0 4.7 5.3l-.5 2.1a2 2 0 0 0 .6 1.9l1.8 1.8a16 16 0 0 0 7.1 7.1l1.8 1.8a2 2 0 0 0 1.9.6l2.1-.5a2 2 0 0 0 1.8-1.9V16a2 2 0 0 0-2-2h-1.2a1 1 0 0 0-.9.6l-.5 1.1a12 12 0 0 1-5.4-5.4l1.1-.5a1 1 0 0 0 .6-.9V7a2 2 0 0 0-2-2H6.6z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function IconNote() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4h9l3 3v13H6z" />
      <path d="M15 4v3h3M8 12h8M8 16h5" />
    </svg>
  )
}

function Field({ label, icon, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/70">{icon}</span>
        {children}
      </div>
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-cream-dark bg-cream/40 py-3 pl-11 pr-4 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15'

const inputErrorClass =
  'w-full rounded-xl border border-red-300 bg-red-50 py-3 pl-11 pr-4 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100'

export function validateShippingField(name, value) {
  const trimmed = (value ?? '').trim()

  if (name === 'hoTen') {
    if (!trimmed) return 'Vui lòng nhập họ tên người nhận.'
    if (trimmed.length < 2) return 'Họ tên quá ngắn.'
    return ''
  }

  if (name === 'soDienThoai') {
    if (!trimmed) return 'Vui lòng nhập số điện thoại.'
    if (!/^(0|\+84)(\s|\d){8,11}$/.test(trimmed.replace(/\s/g, ''))) return 'Số điện thoại không hợp lệ.'
    return ''
  }

  if (name === 'email') {
    if (!trimmed) return 'Vui lòng nhập email nhận xác nhận.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Email không hợp lệ.'
    return ''
  }

  if (name === 'diaChi') {
    if (!trimmed) return 'Vui lòng nhập địa chỉ giao hàng.'
    if (trimmed.length < 5) return 'Địa chỉ giao hàng quá ngắn.'
    return ''
  }

  return ''
}

export function validateShippingForm({ hoTen, soDienThoai, email, diaChi }) {
  return {
    hoTen: validateShippingField('hoTen', hoTen),
    soDienThoai: validateShippingField('soDienThoai', soDienThoai),
    email: validateShippingField('email', email),
    diaChi: validateShippingField('diaChi', diaChi),
  }
}

export default function ShippingFormSection({
  hoTen,
  onHoTenChange,
  onHoTenBlur,
  soDienThoai,
  onSoDienThoaiChange,
  onSoDienThoaiBlur,
  email,
  onEmailChange,
  onEmailBlur,
  diaChi,
  onDiaChiChange,
  onDiaChiBlur,
  ghiChu,
  onGhiChuChange,
  shippingHint = '',
  shippingError = '',
  errors = {},
}) {
  const fieldErrorClass = 'text-sm text-red-600 mt-1'

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm shadow-primary/25">
          1
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-gray-800">Thông tin giao hàng</h2>
          <p className="mt-0.5 text-sm text-gray-500">Flygo sẽ liên hệ và giao hàng tận nơi</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/20 bg-primary-light/60 px-4 py-3 text-sm text-primary">
        <p className="font-semibold">{DELIVERY.area}</p>
        <p className="mt-1 text-primary/90">{DELIVERY.district1Free}</p>
        <p className="text-primary/90">{DELIVERY.otherDistrictNote}</p>
      </div>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Họ tên" icon={<IconUser />}>
            <input
              className={errors.hoTen ? inputErrorClass : inputClass}
              value={hoTen}
              onChange={(e) => onHoTenChange(e.target.value)}
              onBlur={onHoTenBlur}
              placeholder="Họ tên người nhận hàng"
              required
            />
            {errors.hoTen ? <p className={fieldErrorClass}>{errors.hoTen}</p> : null}
          </Field>
          <Field label="Số điện thoại" icon={<IconPhone />}>
            <input
              className={errors.soDienThoai ? inputErrorClass : inputClass}
              type="tel"
              value={soDienThoai}
              onChange={(e) => onSoDienThoaiChange(e.target.value)}
              onBlur={onSoDienThoaiBlur}
              placeholder="Số điện thoại / Zalo khi giao hàng"
              required
            />
            {errors.soDienThoai ? <p className={fieldErrorClass}>{errors.soDienThoai}</p> : null}
          </Field>
        </div>

        <Field label="Email nhận xác nhận" icon={<IconMail />}>
          <input
            className={errors.email ? inputErrorClass : inputClass}
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onEmailBlur}
            placeholder="Email nhận xác nhận & theo dõi đơn"
            autoComplete="email"
            required
          />
          {errors.email ? <p className={fieldErrorClass}>{errors.email}</p> : null}
        </Field>

        <Field label="Địa chỉ giao hàng" icon={<IconPin />}>
          <input
            className={errors.diaChi ? inputErrorClass : inputClass}
            value={diaChi}
            onChange={(e) => onDiaChiChange(e.target.value)}
            onBlur={onDiaChiBlur}
            placeholder="VD: 45 Lê Lợi, Quận 1, TP.HCM"
            autoComplete="street-address"
            required
          />
          {errors.diaChi ? <p className={fieldErrorClass}>{errors.diaChi}</p> : null}
        </Field>
        {!shippingError && shippingHint ? (
          <p className="-mt-2 text-sm text-primary">{shippingHint}</p>
        ) : null}
        {shippingError ? <p className="-mt-2 text-sm text-red-600">{shippingError}</p> : null}

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ghi chú (tùy chọn)</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-3.5 text-primary/70">
              <IconNote />
            </span>
            <textarea
              className={`${inputClass} min-h-[96px] resize-y pt-3`}
              value={ghiChu}
              onChange={(e) => onGhiChuChange(e.target.value)}
              placeholder="Giao giờ trưa, gọi trước 15 phút, để ở bảo vệ..."
            />
          </div>
        </label>
      </div>
    </div>
  )
}
