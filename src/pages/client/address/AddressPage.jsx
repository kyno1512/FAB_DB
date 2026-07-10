import { Link } from 'react-router-dom'
import PageHero from '../../../components/common/PageHero'
import { container } from '../../../lib/classes'
import { STORE } from '../../../constants/store'
import { paths } from '../../../routes/paths'

function InfoTile({ label, value, href, external = false }) {
  const className =
    'text-sm font-semibold text-primary no-underline transition hover:text-primary-dark hover:underline'

  return (
    <div className="rounded-2xl border border-cream-dark bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
      {href ? (
        external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={`mt-1 block ${className}`}>
            {value}
          </a>
        ) : (
          <Link to={href} className={`mt-1 block ${className}`}>
            {value}
          </Link>
        )
      ) : (
        <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
      )}
    </div>
  )
}

export default function AddressPage() {
  return (
    <>
      <PageHero
        eyebrow="Liên hệ Flygo"
        title="Địa chỉ cửa hàng"
        description="Ghé thăm tiệm để thưởng thức bánh tươi và cà phê — hoặc đặt online giao tận nơi."
      />

      <div className={`${container} py-10 sm:py-12 lg:py-14`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-white to-primary-light/40 p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Flygo AI Bakery</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-gray-800">{STORE.address}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{STORE.tagline}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoTile label="Giờ mở cửa" value={`${STORE.hours} · ${STORE.hoursNote}`} />
                <InfoTile label="Hotline" value={STORE.hotline} href={`tel:${STORE.hotlineTel}`} />
                <InfoTile label="Zalo" value={STORE.zaloPhoneDisplay} href={STORE.zaloUrl} external />
                <InfoTile label="Email" value={STORE.email} href={`mailto:${STORE.email}`} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={STORE.mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-primary-dark"
                >
                  Chỉ đường Google Maps
                </a>
                <Link
                  to={paths.PRODUCTS}
                  className="rounded-full border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary no-underline transition hover:bg-primary-light"
                >
                  Xem thực đơn
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Bãi xe', desc: 'Xe máy miễn phí' },
                { title: 'Wi-Fi', desc: 'Tốc độ cao' },
                { title: 'Đặt bàn', desc: 'Theo nhóm 4+' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-black/5">
                  <p className="text-sm font-bold text-gray-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-cream-dark bg-white shadow-lg ring-1 ring-black/5">
            <iframe
              title={`Bản đồ ${STORE.name}`}
              src={STORE.mapEmbedUrl}
              className="aspect-[4/3] w-full min-h-[300px] border-0 sm:min-h-[380px] lg:min-h-[460px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="border-t border-cream-dark px-5 py-4">
              <p className="font-medium text-gray-800">{STORE.address}</p>
              <p className="mt-1 text-sm text-gray-500">Gần phố đi bộ Nguyễn Huệ · Quận 1</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
