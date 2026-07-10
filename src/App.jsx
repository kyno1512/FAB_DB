import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { VoucherProvider } from './context/VoucherContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <VoucherProvider>
          <AppRoutes />
        </VoucherProvider>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
