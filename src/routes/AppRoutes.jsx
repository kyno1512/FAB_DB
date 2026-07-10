import { Route, Routes } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import { paths } from './paths'
import { clientRoutes } from './clientRoutes'
import { adminRoutes } from './adminRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      {clientRoutes}
      {adminRoutes}

      <Route element={<AuthLayout />}>
        <Route path={paths.LOGIN} element={<LoginPage />} />
        <Route path={paths.REGISTER} element={<RegisterPage />} />
        <Route path={paths.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={paths.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>
    </Routes>
  )
}
