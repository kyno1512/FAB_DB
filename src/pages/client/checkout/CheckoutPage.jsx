import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { container } from '../../../lib/classes'
import { formatPrice } from '../../../lib/formatPrice'
import { PAYMENT_METHOD } from '../../../constants/payment'
import { getUser } from '../../../lib/authStorage'
import { useCart } from '../../../context/CartContext'
import { useVoucher } from '../../../context/VoucherContext'
import { formatOrderCode } from '../../../lib/orderStatus'
import { calcShippingFee } from '../../../lib/shippingFee'
import { SWAL_CONFIRM_COLOR } from '../../../lib/swal'
import { paths } from '../../../routes/paths'
import { getProfile } from '../../../services/authService'
import { createOrder } from '../../../services/orderService'
import { createVnpayPayment } from '../../../services/paymentService'
import CheckoutSteps from './components/CheckoutSteps'
import OrderSummaryCard from './components/OrderSummaryCard'
import PromoCodeBox from './components/PromoCodeBox'
import PaymentMethodPicker from './components/PaymentMethodPicker'
import ShippingFormSection, { validateShippingForm } from './components/ShippingFormSection'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { applied, soTienGiam, clearVoucher } = useVoucher()
  const user = getUser()
  const maNguoiDung = user?.maNguoiDung
  const profileLoaded = useRef(false)
  const orderSubmitted = useRef(false)

  const [hoTen, setHoTen] = useState('')
  const [soDienThoai, setSoDienThoai] = useState('')
  const [email, setEmail] = useState('')
  const [diaChi, setDiaChi] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.COD)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (items.length === 0 && !orderSubmitted.current) {
      navigate(paths.CART, { replace: true })
    }
  }, [items.length, navigate])

  useEffect(() => {
    if (!maNguoiDung || profileLoaded.current) return
    profileLoaded.current = true

    getProfile(maNguoiDung)
      .then((profile) => {
        setHoTen(profile.hoTen ?? '')
        setSoDienThoai(profile.soDienThoai ?? '')
        setEmail(profile.email ?? '')
        setDiaChi(profile.diaChi ?? '')
      })
      .catch(() => {
        setHoTen(user?.hoTen ?? '')
        setEmail(user?.email ?? '')
      })
  }, [maNguoiDung, user?.hoTen])

  function validateAll() {
    const next = validateShippingForm({ hoTen, soDienThoai, email, diaChi })
    setFieldErrors(next)
    return Object.values(next).every((message) => message === '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validateAll()) {
      setError('Vui lòng kiểm tra lại thông tin giao hàng.')
      return
    }

    setLoading(true)

    try {
      const order = await createOrder({
        maNguoiDung: user?.maNguoiDung,
        hoTen: hoTen.trim(),
        soDienThoai: soDienThoai.trim(),
        email: email.trim(),
        diaChi: diaChi.trim(),
        ghiChu: ghiChu.trim() || undefined,
        phuongThucThanhToan: paymentMethod === PAYMENT_METHOD.COD ? 'COD' : 'VNPay',
        maCode: applied?.maCode,
        items: items.map((x) => ({ maSanPham: x.id, soLuong: x.qty })),
      })

      if (paymentMethod === PAYMENT_METHOD.CARD) {
        const payment = await createVnpayPayment(order.maDonHang)
        clearCart()
        clearVoucher()
        window.location.href = payment.paymentUrl
        return
      }

      orderSubmitted.current = true

      const qs = new URLSearchParams({
        success: 'true',
        method: 'cod',
        order: String(order.maDonHang),
        emailSent: order.emailSent ? 'true' : 'false',
        alert: '1',
      })
      if (order.trackingToken) qs.set('t', order.trackingToken)

      const orderLabel = formatOrderCode(order.maDonHang)

      await Swal.fire({
        icon: 'success',
        title: 'Đặt hàng COD thành công!',
        html: `
          <p style="margin:0 0 8px;font-weight:600;color:#1e6b6b">${orderLabel}</p>
          <p style="margin:0">Đơn hàng đã được ghi nhận. Bạn thanh toán tiền mặt khi nhận hàng.</p>
        `,
        confirmButtonText: order.trackingToken ? 'Theo dõi đơn' : 'Đã hiểu',
        confirmButtonColor: SWAL_CONFIRM_COLOR,
        showCancelButton: Boolean(order.trackingToken),
        cancelButtonText: 'Đóng',
      }).then((result) => {
        clearCart()
        clearVoucher()
        if (result.isConfirmed && order.trackingToken) {
          navigate(`${paths.ORDER_TRACK}?t=${encodeURIComponent(order.trackingToken)}`)
        } else {
          navigate(`${paths.PAYMENT_RESULT}?${qs.toString()}`)
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const touchedRef = useRef({})

  function markTouched(field) {
    touchedRef.current[field] = true
    setFieldErrors((prev) => ({
      ...prev,
      ...validateShippingForm({ hoTen, soDienThoai, email, diaChi }),
    }))
  }

  function handleFieldChange(updater, field) {
    return (value) => {
      updater(value)
      if (touchedRef.current[field]) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: validateShippingField(field, value),
        }))
      }
    }
  }

  const shipping = useMemo(() => calcShippingFee(diaChi), [diaChi])
  const shippingFee = shipping.fee ?? 0

  const total = Math.max(0, subtotal + shippingFee - soTienGiam)

  const submitLabel =
    paymentMethod === PAYMENT_METHOD.COD
      ? `Đặt hàng COD · ${formatPrice(total)}`
      : `Thanh toán VNPay · ${formatPrice(total)}`

  return (
    <div className="pb-24 pt-6 sm:pb-24 sm:pt-10 lg:pb-12">
      <div className={container}>
        <CheckoutSteps current={2} />

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!user && (
              <div className="rounded-2xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
                <Link to={paths.LOGIN} className="font-semibold underline">
                  Đăng nhập
                </Link>{' '}
                để lưu thông tin giao hàng cho lần sau.
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-cream-dark bg-white shadow-sm">
              <div className="border-b border-cream-dark bg-gradient-to-r from-primary-light/80 via-cream to-cream px-5 py-4 sm:px-6">
                <h1 className="font-display text-xl font-semibold text-gray-800">Hoàn tất đơn hàng</h1>
                <p className="mt-0.5 text-sm text-gray-500">Điền thông tin và chọn hình thức thanh toán</p>
              </div>

              <div className="space-y-8 p-5 sm:p-6">
                <ShippingFormSection
                  hoTen={hoTen}
                  onHoTenChange={handleFieldChange(setHoTen, 'hoTen')}
                  soDienThoai={soDienThoai}
                  onSoDienThoaiChange={handleFieldChange(setSoDienThoai, 'soDienThoai')}
                  email={email}
                  onEmailChange={handleFieldChange(setEmail, 'email')}
                  diaChi={diaChi}
                  onDiaChiChange={handleFieldChange(setDiaChi, 'diaChi')}
                  ghiChu={ghiChu}
                  onGhiChuChange={handleFieldChange(setGhiChu, 'ghiChu')}
                  shippingHint={shipping.hint}
                  shippingError={shipping.ok ? '' : shipping.error}
                  errors={fieldErrors}
                />

                <div className="h-px bg-cream-dark" />

                <div>
                  <div className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm shadow-primary/25">
                      2
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-gray-800">Phương thức thanh toán</h2>
                      <p className="mt-0.5 text-sm text-gray-500">COD hoặc thanh toán online qua VNPay</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
                  </div>
                </div>
              </div>

              <div className="border-t border-cream-dark bg-cream/30 px-5 py-4 sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary py-4 font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-70"
                >
                  {loading ? 'Đang xử lý...' : submitLabel}
                </button>
              </div>
            </div>
          </form>

          <aside className="lg:sticky lg:top-28">
            <OrderSummaryCard
              items={items}
              subtotal={subtotal}
              shipping={shippingFee}
              shippingHint={shipping.hint}
              discount={soTienGiam}
              showImages
              promoSlot={<PromoCodeBox subtotal={subtotal} email={email} />}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
