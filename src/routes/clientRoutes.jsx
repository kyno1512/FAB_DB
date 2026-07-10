import { Route } from 'react-router-dom'
import AccountLayout from '../layouts/AccountLayout'
import ClientLayout from '../layouts/ClientLayout'
import AccountPage from '../pages/client/account/AccountPage'
import AccountOrdersPage from '../pages/client/account/AccountOrdersPage'
import AccountPointsPage from '../pages/client/account/AccountPointsPage'
import ProfilePage from '../pages/client/account/ProfilePage'
import SecurityPage from '../pages/client/account/SecurityPage'
import HomePage from '../pages/client/home/HomePage'
import NewsPage from '../pages/client/news/NewsPage'
import AddressPage from '../pages/client/address/AddressPage'
import ProductsPage from '../pages/client/products/ProductsPage'
import ProductDetailPage from '../pages/client/products/ProductDetailPage'
import CartPage from '../pages/client/cart/CartPage'
import CheckoutPage from '../pages/client/checkout/CheckoutPage'
import PaymentResultPage from '../pages/client/checkout/PaymentResultPage'
import OrderTrackPage from '../pages/client/orders/OrderTrackPage'
import { paths } from './paths'

export const clientRoutes = (
  <Route element={<ClientLayout />}>
    <Route path={paths.CLIENT_HOME} element={<HomePage />} />
    <Route path={paths.NEWS} element={<NewsPage />} />
    <Route path={paths.ADDRESS} element={<AddressPage />} />
    <Route path={paths.PRODUCT_DETAIL} element={<ProductDetailPage />} />
    <Route path={paths.PRODUCTS} element={<ProductsPage />} />
    <Route path={paths.CART} element={<CartPage />} />
    <Route path={paths.CHECKOUT} element={<CheckoutPage />} />
    <Route path={paths.PAYMENT_RESULT} element={<PaymentResultPage />} />
    <Route path={paths.ORDER_TRACK} element={<OrderTrackPage />} />
    <Route path={paths.ACCOUNT} element={<AccountLayout />}>
      <Route index element={<AccountPage />} />
      <Route path="orders" element={<AccountOrdersPage />} />
      <Route path="points" element={<AccountPointsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="security" element={<SecurityPage />} />
    </Route>
  </Route>
)
