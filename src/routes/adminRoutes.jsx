import { Route } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import DashboardPage from '../pages/admin/dashboard/DashboardPage'
import MenuPage from '../pages/admin/menu/MenuPage'
import ProductFormPage from '../pages/admin/menu/ProductFormPage'
import OrdersPage from '../pages/admin/orders/OrdersPage'
import StaffPage from '../pages/admin/staff/StaffPage'
import CustomersPage from '../pages/admin/customers/CustomersPage'
import PromotionsPage from '../pages/admin/promotions/PromotionsPage'
import NewsAdminPage from '../pages/admin/news/NewsAdminPage'
import ReportsPage from '../pages/admin/reports/ReportsPage'
import InventoryPage from '../pages/admin/inventory/InventoryPage'
import RecipesPage from '../pages/admin/recipes/RecipesPage'
import SupplierDebtPage from '../pages/admin/supplierDebt/SupplierDebtPage'
import AdminAccountPage from '../pages/admin/account/AdminAccountPage'
import { paths } from './paths'

export const adminRoutes = (
  <Route element={<AdminLayout />}>
    <Route path={paths.ADMIN_DASHBOARD} element={<DashboardPage />} />
    <Route path={paths.ADMIN_ORDERS} element={<OrdersPage />} />
    <Route path={paths.ADMIN_STAFF} element={<StaffPage />} />
    <Route path={paths.ADMIN_CUSTOMERS} element={<CustomersPage />} />
    <Route path={paths.ADMIN_INVENTORY} element={<InventoryPage />} />
    <Route path={paths.ADMIN_RECIPES} element={<RecipesPage />} />
    <Route path={paths.ADMIN_SUPPLIER_DEBT} element={<SupplierDebtPage />} />
    <Route path={paths.ADMIN_MENU} element={<MenuPage />} />
    <Route path={paths.ADMIN_MENU_NEW_COMBO} element={<ProductFormPage comboMode />} />
    <Route path={paths.ADMIN_MENU_NEW} element={<ProductFormPage />} />
    <Route path={paths.ADMIN_MENU_EDIT} element={<ProductFormPage />} />
    <Route path={paths.ADMIN_PROMOTIONS} element={<PromotionsPage />} />
    <Route path={paths.ADMIN_NEWS} element={<NewsAdminPage />} />
    <Route path={paths.ADMIN_REPORTS} element={<ReportsPage />} />
    <Route path={paths.ADMIN_CHANGE_PASSWORD} element={<AdminAccountPage />} />
  </Route>
)
