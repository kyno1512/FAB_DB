import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-cream font-sans text-gray-800">
      <Outlet />
    </div>
  )
}
