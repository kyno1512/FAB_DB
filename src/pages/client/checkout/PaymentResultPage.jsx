import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { container } from '../../../lib/classes'
import { useCart } from '../../../context/CartContext'
import { formatOrderCode } from '../../../lib/orderStatus'
import { SWAL_CONFIRM_COLOR } from '../../../lib/swal'
import { paths } from '../../../routes/paths'
import CheckoutSteps from './components/CheckoutSteps'

export default function PaymentResultPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { clearCart } = useCart()
  const alertShown = useRef(false)

  const success = params.get('success') === 'true'
  const method = params.get('method') ?? ''
  const orderId = params.get('order') ?? params.get('txnRef') ?? ''
  const code = params.get('code') ?? ''
  const trackingToken = params.get('t') ?? ''
  const emailSent = params.get('emailSent') === 'true'
  const skipAlert = params.get('alert') === '1'
  const isCod = method === 'cod'

  useEffect(() => {
    if (success) clearCart()
  }, [success, clearCart])

  useEffect(() => {
    if (!success || skipAlert || alertShown.current) return
    alertShown.current = true

    const orderLabel = orderId ? formatOrderCode(orderId) : ''
    const baseMessage = isCod
      ? 'Đơn hàng đã được ghi nhận. Bạn thanh toán tiền mặt khi nhận hàng.'
      : 'Cảm ơn bạn! Đơn hàng đã được thanh toán và đang xử lý.'

    Swal.fire({
      icon: 'success',
      title: isCod ? 'Đặt hàng COD thành công!' : 'Thanh toán thành công!',
      html: `
        ${orderLabel ? `<p style="margin:0 0 8px;font-weight:600;color:#1e6b6b">${orderLabel}</p>` : ''}
        <p style="margin:0">${baseMessage}</p>
      `,
      confirmButtonText: trackingToken ? 'Theo dõi đơn' : 'Đã hiểu',
      confirmButtonColor: SWAL_CONFIRM_COLOR,
      showCancelButton: Boolean(trackingToken),
      cancelButtonText: 'Đóng',
    }).then((result) => {
      if (result.isConfirmed && trackingToken) {
        navigate(`${paths.ORDER_TRACK}?t=${encodeURIComponent(trackingToken)}`)
      }
    })
  }, [success, skipAlert, isCod, orderId, trackingToken, emailSent, navigate])

  const trackPath = trackingToken
    ? `${paths.ORDER_TRACK}?t=${encodeURIComponent(trackingToken)}`
    : null

  return (
    <div className="py-10 sm:py-14">
      <div className={`${container} mx-auto max-w-lg`}>
        <CheckoutSteps current={3} />

        <div className="mt-4 rounded-3xl border border-cream-dark bg-white p-8 text-center shadow-sm sm:p-10">
          <div
            className={`mx-auto grid size-20 place-items-center rounded-full text-3xl ${
              success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
            }`}
          >
            {success ? '✓' : '✕'}
          </div>

          <h1 className="mt-6 font-display text-2xl font-semibold text-gray-800">
            {success
              ? isCod
                ? 'Đặt hàng COD thành công!'
                : 'Thanh toán thành công!'
              : 'Thanh toán chưa hoàn tất'}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            {success
              ? isCod
                ? 'Đơn hàng đã được ghi nhận. Bạn thanh toán tiền mặt khi nhận hàng.'
                : 'Cảm ơn bạn! Đơn hàng đã được thanh toán và đang xử lý.'
              : 'Giao dịch bị hủy hoặc thất bại. Bạn có thể thử lại.'}
          </p>

          {orderId && (
            <p className="mt-4 inline-block rounded-full bg-cream px-4 py-1.5 text-xs text-gray-600">
              Mã đơn: {formatOrderCode(orderId)}
              {code && !isCod ? ` · VNPay: ${code}` : ''}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {trackPath && (
              <Link
                to={trackPath}
                className="rounded-full bg-primary px-6 py-3 font-semibold text-white no-underline hover:bg-primary-dark"
              >
                Theo dõi đơn hàng
              </Link>
            )}
            <Link
              to={paths.PRODUCTS}
              className="rounded-full border border-cream-dark px-6 py-3 font-semibold text-gray-700 no-underline hover:bg-cream"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              to={paths.ACCOUNT}
              className="rounded-full border border-cream-dark px-6 py-3 font-semibold text-gray-700 no-underline hover:bg-cream"
            >
              Tài khoản
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
