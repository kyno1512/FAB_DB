export const SHIPPING_FEE_OTHER_DISTRICT = 15000

function normalizeAddress(value) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

export function isHoChiMinhCity(address) {
  const n = normalizeAddress(address)
  return (
    n.includes('ho chi minh') ||
    n.includes('hcm') ||
    n.includes('tp hcm') ||
    n.includes('tp.hcm') ||
    n.includes('tphcm') ||
    n.includes('sai gon') ||
    n.includes('saigon') ||
    n.includes('thanh pho ho chi minh')
  )
}

export function isDistrict1(address) {
  const n = normalizeAddress(address)
  if (/(?:quan|q\.?)\s*1(?!\d)/i.test(n)) return true
  if (/\bq\s*1\b/i.test(n)) return true
  if (n.includes('nguyen hue') && n.includes('quan 1')) return true
  return false
}

/** @returns {{ ok: boolean, fee: number, error?: string, hint?: string }} */
export function calcShippingFee(address) {
  const addr = address?.trim()
  if (!addr) {
    return { ok: true, fee: 0, hint: 'Nhập địa chỉ TP.HCM để tính phí giao' }
  }

  if (!isHoChiMinhCity(addr)) {
    return { ok: false, fee: 0, error: 'Hiện chỉ giao hàng trong TP. Hồ Chí Minh.' }
  }

  if (isDistrict1(addr)) {
    return { ok: true, fee: 0, hint: 'Quận 1 — miễn phí giao hàng' }
  }

  return { ok: true, fee: SHIPPING_FEE_OTHER_DISTRICT, hint: 'Phí giao nội thành: 15.000đ' }
}
