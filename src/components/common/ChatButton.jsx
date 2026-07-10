import { useState } from 'react'
import { IconChat } from '../ui/icons'
import ChatWidget from './ChatWidget'

export default function ChatButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-[90px] md:bottom-7 right-4 md:right-7 z-[200] grid size-14 place-items-center rounded-full text-white shadow-lg transition hover:scale-105 ${
          open ? 'bg-primary-dark' : 'bg-primary hover:bg-primary-dark'
        }`}
        aria-label={open ? 'Đóng chat hỗ trợ' : 'Mở chat hỗ trợ'}
        aria-expanded={open}
      >
        <IconChat />
      </button>
      <ChatWidget open={open} onClose={() => setOpen(false)} />
    </>
  )
}
