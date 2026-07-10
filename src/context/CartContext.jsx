import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CART_STORAGE_KEY } from '../constants/cart'
import { AUTH_CHANGE_EVENT, getUser } from '../lib/authStorage'
import axiosClient from '../lib/axiosClient'
import { getMaxAvailableBatch } from '../services/productService'

const CartContext = createContext(null)

function readCart() {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY)
    return raw && raw !== "null" ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCart(items) {
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [toast, setToast] = useState('')
  const [user, setUser] = useState(getUser)

  useEffect(() => {
    const refreshUser = () => setUser(getUser())
    window.addEventListener(AUTH_CHANGE_EVENT, refreshUser)
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, refreshUser)
  }, [])

  // Load from backend if logged in
  useEffect(() => {
    if (user?.maNguoiDung) {
      const localItems = readCart()
      if (localItems.length > 0) {
        axiosClient.post(`/GioHang/${user.maNguoiDung}/sync`, { items: localItems })
          .then(async (res) => {
            const items = Array.isArray(res) ? res : []
            setItems(items)
            sessionStorage.removeItem(CART_STORAGE_KEY)
            if (items.length > 0) {
              try {
                const ids = items.map((x) => x.id)
                const maxMap = await getMaxAvailableBatch(ids)
                mergeItemMaxAvailable(maxMap)
              } catch {}
            }
          })
          .catch(err => console.error(err))
      } else {
        axiosClient.get(`/GioHang/${user.maNguoiDung}`)
          .then(async (res) => {
            const items = Array.isArray(res) ? res : []
            setItems(items)
            if (items.length > 0) {
              try {
                const ids = items.map((x) => x.id)
                const maxMap = await getMaxAvailableBatch(ids)
                mergeItemMaxAvailable(maxMap)
              } catch {}
            }
          })
          .catch(err => console.error(err))
      }
    } else {
      // If logged out, load from sessionStorage
      setItems(readCart())
    }
  }, [user?.maNguoiDung])

  // Save to sessionStorage if NOT logged in
  useEffect(() => {
    if (!user?.maNguoiDung) {
      writeCart(items)
    }
  }, [items, user?.maNguoiDung])

  const showToast = useCallback((message) => {
    setToast(message)
    const timer = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(timer)
  }, [])

  const addItem = useCallback(async (product, qty = 1) => {
    if (user?.maNguoiDung) {
      try {
        const res = await axiosClient.post(`/GioHang/${user.maNguoiDung}/add`, { 
          productId: product.id, 
          qty,
          sizeId: product.sizeId || null 
        })
        setItems(Array.isArray(res) ? res : [])
        showToast(`Đã thêm ${product.name} vào giỏ`)
      } catch (err) {
        console.error(err)
      }
    } else {
      setItems((prev) => {
        // Find by id + sizeId to allow same product with different sizes
        const idx = prev.findIndex((x) => x.id === product.id && x.sizeId === product.sizeId)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], qty: next[idx].qty + qty }
          return next
        }
        return [...prev, { ...product, qty }]
      })
      showToast(`Đã thêm ${product.name} vào giỏ`)
    }
  }, [showToast, user?.maNguoiDung])

  const addItemWithMax = useCallback((product, qty = 1, maxAvailable = null) => {
    if (user?.maNguoiDung) {
      // Sync to backend immediately to prevent cart reset on page navigation
      axiosClient.post(`/GioHang/${user.maNguoiDung}/add`, {
        productId: product.id,
        qty,
        sizeId: product.sizeId || null,
      }).then((res) => {
        setItems(Array.isArray(res) ? res : [])
      }).catch(err => console.error(err))
    }
    // Always update local state for UI responsiveness
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === product.id && x.sizeId === product.sizeId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty, maxAvailable: maxAvailable ?? next[idx].maxAvailable }
        return next
      }
      return [...prev, { ...product, qty, maxAvailable: maxAvailable ?? null }]
    })
    showToast(`Đã thêm ${product.name} vào giỏ`)
  }, [showToast, user?.maNguoiDung])

  const updateQty = useCallback(async (id, qty, sizeId = null) => {
    if (user?.maNguoiDung) {
      try {
        const res = await axiosClient.put(`/GioHang/${user.maNguoiDung}/update`, { 
          productId: id, 
          qty,
          sizeId 
        })
        setItems(Array.isArray(res) ? res : [])
      } catch (err) {
        console.error(err)
      }
    } else {
      setItems((prev) => {
        if (qty < 1) return prev.filter((x) => !(x.id === id && x.sizeId === sizeId))
        return prev.map((x) => (x.id === id && x.sizeId === sizeId ? { ...x, qty } : x))
      })
    }
  }, [user?.maNguoiDung])

  const removeItem = useCallback(async (id, sizeId = null) => {
    if (user?.maNguoiDung) {
      try {
        const url = sizeId 
          ? `/GioHang/${user.maNguoiDung}/remove/${id}?sizeId=${sizeId}`
          : `/GioHang/${user.maNguoiDung}/remove/${id}`
        const res = await axiosClient.delete(url)
        setItems(Array.isArray(res) ? res : [])
      } catch (err) {
        console.error(err)
      }
    } else {
      setItems((prev) => prev.filter((x) => !(x.id === id && x.sizeId === sizeId)))
    }
  }, [user?.maNguoiDung])

  const updateItemMaxAvailable = useCallback((id, maxAvailable) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, maxAvailable } : x)),
    )
  }, [])

  const mergeItemMaxAvailable = useCallback((maxAvailableMap) => {
    setItems((prev) =>
      prev.map((x) => {
        const max = maxAvailableMap[x.id]
        return max !== undefined ? { ...x, maxAvailable: max } : x
      }),
    )
  }, [])

  const clearCart = useCallback(async () => {
    if (user?.maNguoiDung) {
      try {
        await axiosClient.delete(`/GioHang/${user.maNguoiDung}/clear`)
        setItems([])
      } catch (err) {
        console.error(err)
      }
    } else {
      setItems([])
    }
  }, [user?.maNguoiDung])

  const safeItems = Array.isArray(items) ? items : []
  const totalCount = useMemo(() => safeItems.reduce((sum, x) => sum + (x?.qty || 0), 0), [safeItems])
  const subtotal = useMemo(() => safeItems.reduce((sum, x) => sum + (x?.price || 0) * (x?.qty || 0), 0), [safeItems])

  const value = useMemo(
    () => ({
      items: safeItems,
      totalCount,
      subtotal,
      toast,
      addItem,
      addItemWithMax,
      updateQty,
      removeItem,
      clearCart,
      updateItemMaxAvailable,
      mergeItemMaxAvailable,
    }),
    [safeItems, totalCount, subtotal, toast, addItem, addItemWithMax, updateQty, removeItem, clearCart, updateItemMaxAvailable, mergeItemMaxAvailable],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
