export const PAYMENT_METHOD = {
  COD: 'cod',
  CARD: 'card',
}

export const PAYMENT_OPTIONS = [
  {
    id: PAYMENT_METHOD.COD,
    title: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Trả tiền mặt khi shipper giao tận nơi',
    badge: 'Phổ biến',
  },
  {
    id: PAYMENT_METHOD.CARD,
    title: 'Thẻ / QR / Ví (VNPay)',
    desc: 'Visa, Mastercard, ATM, QR ngân hàng',
    badge: 'Online',
  },
]
