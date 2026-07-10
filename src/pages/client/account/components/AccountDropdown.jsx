import { useState, useRef, useEffect } from 'react'
import { getAccountIcon } from './accountIcons'

export default function AccountDropdown({ menu, currentPath, onSelect, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [open])

  function handleSelect(path) {
    setOpen(false)
    if (path) {
      onSelect(path)
    }
  }

  const currentItem = menu.find((item) => item.path === currentPath) || menu[0]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-cream-dark bg-white px-4 py-3.5 text-left text-sm font-semibold text-gray-800 shadow-sm transition hover:border-primary/60 hover:shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {currentItem && getAccountIcon(currentItem.id)}
          <span>{currentItem?.label ?? 'Menu'}</span>
        </span>
        <svg
          className={`size-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-cream-dark bg-white shadow-lg">
          <ul className="max-h-72 overflow-y-auto py-1" role="listbox">
            {menu.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.path === currentPath}
                  onClick={() => handleSelect(item.path)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition ${
                    item.path === currentPath
                      ? 'bg-primary-light font-semibold text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getAccountIcon(item.id)}
                  <span className="flex-1">{item.label}</span>
                  {item.path === currentPath && (
                    <svg className="size-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m5 13 4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
            <li className="border-t border-gray-100" />
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onLogout()
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
