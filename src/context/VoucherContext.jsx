import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { VOUCHER_STORAGE_KEY } from '../constants/voucher'
import { validateVoucher } from '../services/voucherService'

const VoucherContext = createContext(null)

function readStored() {
  try {
    const raw = sessionStorage.getItem(VOUCHER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStored(value) {
  if (value) sessionStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(value))
  else sessionStorage.removeItem(VOUCHER_STORAGE_KEY)
}

export function VoucherProvider({ children }) {
  const [applied, setApplied] = useState(readStored)

  const clearVoucher = useCallback(() => {
    setApplied(null)
    writeStored(null)
  }, [])

  const applyVoucher = useCallback(async (maCode, subtotal, email) => {
    const data = await validateVoucher({ maCode, subtotal, email })
    const next = {
      maCode: data.maCode,
      tenVoucher: data.tenVoucher,
      soTienGiam: data.soTienGiam,
      tongThanhToan: data.tongThanhToan,
    }
    setApplied(next)
    writeStored(next)
    return next
  }, [])

  const value = useMemo(
    () => ({
      applied,
      soTienGiam: applied?.soTienGiam ?? 0,
      applyVoucher,
      clearVoucher,
    }),
    [applied, applyVoucher, clearVoucher],
  )

  return <VoucherContext.Provider value={value}>{children}</VoucherContext.Provider>
}

export function useVoucher() {
  const ctx = useContext(VoucherContext)
  if (!ctx) throw new Error('useVoucher must be used within VoucherProvider')
  return ctx
}
