import { IconSidebarToggle } from './adminIcons'

export default function AdminTopBar({ collapsed, onToggle }) {
  return (
    <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        aria-label={collapsed ? 'Mở rộng menu bên trái' : 'Thu gọn menu bên trái'}
        aria-expanded={!collapsed}
        className="grid size-9 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-primary/30 hover:bg-primary-light hover:text-primary"
      >
        <IconSidebarToggle />
      </button>

      <p className="hidden text-sm text-gray-500 sm:block">
        {collapsed ? 'Menu đang thu gọn — bấm để mở rộng' : 'Bấm để thu gọn menu, xem rộng hơn nội dung bên phải'}
      </p>
    </header>
  )
}
