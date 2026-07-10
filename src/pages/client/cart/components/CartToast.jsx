import { useCart } from '../../../../context/CartContext'

export default function CartToast() {
  const { toast } = useCart()
  if (!toast) return null

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-[60] max-w-xs rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg sm:bottom-8">
      {toast}
    </div>
  )
}
