import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUser } from '../../../lib/authStorage'
import { getMemberTier, getNextTierProgress } from '../../../lib/orderStatus'
import { paths } from '../../../routes/paths'
import { getProfile } from '../../../services/authService'

const BENEFITS = [
  { tier: 'Thành viên thường', items: ['Tích 1 điểm / 10.000đ', 'Ưu đãi sinh nhật', 'Thông báo khuyến mãi'] },
  { tier: 'Thành viên VIP', items: ['Giảm 5% đơn từ 200k', 'Ưu tiên giao hàng', 'Quà tặng mùa lễ'] },
]

export default function AccountPointsPage() {
  const userId = getUser()?.maNguoiDung
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return

    getProfile(userId)
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
        Đang tải điểm tích lũy...
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-red-600">{error || 'Không tải được dữ liệu.'}</p>
      </div>
    )
  }

  const points = profile.diemTichLuy ?? 0
  const tier = getMemberTier(points)
  const progress = getNextTierProgress(points)

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-[#2a8585] p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">Điểm tích lũy</p>
        <p className="mt-3 font-display text-5xl font-bold">{points}</p>
        <p className="mt-2 text-sm text-white/90">Hạng hiện tại: {tier.label}</p>

        {progress.remaining > 0 ? (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-white/80">
              <span>Tiến độ lên {progress.label}</span>
              <span>Còn {progress.remaining} điểm</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-white/90">Bạn đã đạt hạng VIP — tận hưởng ưu đãi đặc biệt!</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {BENEFITS.map((group) => (
          <div key={group.tier} className="rounded-2xl border border-cream-dark bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-gray-800">{group.tier}</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-cream-dark bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-gray-800">Cách tích điểm</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Mỗi đơn hàng hoàn thành sẽ được cộng điểm vào tài khoản. Điểm dùng để xét hạng thành viên và nhận ưu đãi
          riêng tại Flygo.
        </p>
        <Link
          to={paths.PRODUCTS}
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-primary-dark"
        >
          Đặt hàng để tích điểm
        </Link>
      </div>
    </div>
  )
}
