function getInitials(name) {
  if (!name) return 'NCC'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function InfoCard({ icon, label, value, href }) {
  const content = value || '—'
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition hover:border-primary/15 hover:bg-primary/[0.03]">
      <div className="mb-2 flex items-center gap-2 text-primary/80">{icon}</div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      {href && value ? (
        <a href={href} className="mt-1 block text-sm font-medium text-gray-800 hover:text-primary">
          {content}
        </a>
      ) : (
        <p className="mt-1 text-sm font-medium text-gray-800">{content}</p>
      )}
    </div>
  )
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconFileText() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export default function SupplierDetailModal({ supplier, onClose, onEdit }) {
  if (!supplier) return null

  const active = supplier.trangThai
  const joinedDate = supplier.ngayTao
    ? new Date(supplier.ngayTao).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-emerald-50/40 px-6 pb-6 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/80 text-gray-500 shadow-sm transition hover:bg-white hover:text-gray-800"
            aria-label="Đóng"
          >
            ×
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-white shadow-lg shadow-primary/25">
              {getInitials(supplier.tenNhaCungCap)}
            </div>
            <div className="min-w-0 pt-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">Nhà cung cấp</p>
              <h3 className="font-display text-2xl font-bold leading-tight text-gray-800">{supplier.tenNhaCungCap}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-500 shadow-sm">
                  Mã #{supplier.maNhaCungCap}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {active ? 'Đang hợp tác' : 'Ngừng hợp tác'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-2">
          <InfoCard icon={<IconUser />} label="Người liên hệ" value={supplier.nguoiLienHe} />
          <InfoCard
            icon={<IconPhone />}
            label="Số điện thoại"
            value={supplier.soDienThoai}
            href={supplier.soDienThoai ? `tel:${supplier.soDienThoai}` : undefined}
          />
          <InfoCard
            icon={<IconMail />}
            label="Email"
            value={supplier.email}
            href={supplier.email ? `mailto:${supplier.email}` : undefined}
          />
          <InfoCard icon={<IconFileText />} label="Mã số thuế" value={supplier.maSoThue} />
          <InfoCard icon={<IconMapPin />} label="Địa chỉ" value={supplier.diaChi} />
          {joinedDate && <InfoCard icon={<IconCalendar />} label="Ngày thêm" value={joinedDate} />}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => onEdit(supplier)}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary/90"
          >
            Sửa thông tin
          </button>
        </div>
      </div>
    </div>
  )
}

export { getInitials }
