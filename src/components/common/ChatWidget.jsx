import { useEffect, useRef, useState } from 'react'
import ZaloIcon from '../icons/ZaloIcon'
import { STORE } from '../../constants/store'
import { getUser } from '../../lib/authStorage'
import { getChatStatus, sendChatMessage } from '../../services/chatService'

const SESSION_KEY = 'flygo_chat_session'
const QUICK_PROMPTS = [
  'Gợi ý combo bánh và cà phê',
  'Thanh toán COD là gì?',
  'Có những sản phẩm nào?',
]

const WELCOME_MESSAGE = `Xin chào! Mình là Flygo AI — gợi ý món, combo và hướng dẫn đặt hàng. Bạn cần gì nhé?

Cần hỗ trợ trực tiếp, nhắn Zalo: ${STORE.zaloPhoneDisplay} (${STORE.zaloPhone}).`

function formatChatError(message) {
  return message || 'Không gửi được tin nhắn. Thử lại sau.'
}

function BotAvatar() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">
      F
    </span>
  )
}

export default function ChatWidget({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: WELCOME_MESSAGE,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [lastSource, setLastSource] = useState(null)
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem(SESSION_KEY) ?? '')
  const listRef = useRef(null)

  useEffect(() => {
    if (!open) return
    getChatStatus()
      .then((s) => setHasApiKey(s.configured))
      .catch(() => setHasApiKey(false))
  }, [open])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading])

  async function handleSend(text) {
    const message = (text ?? input).trim()
    if (!message || loading) return

    setInput('')
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: message }])
    setLoading(true)

    try {
      const user = getUser()
      const res = await sendChatMessage({
        message,
        sessionId: sessionId || undefined,
        maNguoiDung: user?.maNguoiDung,
      })

      if (res.sessionId) {
        setSessionId(res.sessionId)
        sessionStorage.setItem(SESSION_KEY, res.sessionId)
      }

      if (res.source) setLastSource(res.source)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', text: res.reply, source: res.source },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          text: formatChatError(err.message),
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed bottom-24 right-5 z-[210] flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-cream-dark bg-white shadow-2xl sm:right-7">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-white">
        <div>
          <p className="font-semibold">Flygo AI</p>
          <p className="text-xs text-white/75">
            {lastSource === 'gemini'
              ? 'Gemini AI · đang trả lời thông minh'
              : lastSource === 'menu'
                ? 'Trợ lý menu · Gemini chưa kết nối'
                : hasApiKey
                  ? 'Gemini AI · gợi ý món & đặt hàng'
                  : 'Trợ lý gợi ý món & đặt hàng'}
          </p>
          <a
            href={STORE.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/25"
          >
            <ZaloIcon size={18} />
            <span>{STORE.zaloPhone}</span>
          </a>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-full text-lg transition hover:bg-white/15"
          aria-label="Đóng chat"
        >
          ×
        </button>
      </div>

      <div ref={listRef} className="flex max-h-[340px] min-h-[280px] flex-col gap-3 overflow-y-auto bg-cream/40 px-4 py-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'bot' && <BotAvatar />}
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : msg.error
                    ? 'border border-red-200 bg-red-50 text-red-700'
                    : 'border border-cream-dark bg-white text-gray-700'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
              {msg.source && (
                <p className="mt-1.5 text-[10px] text-gray-400">
                  {msg.source === 'gemini' ? '✦ Gemini AI' : '◎ Menu Flygo'}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <BotAvatar />
            <div className="rounded-2xl border border-cream-dark bg-white px-3.5 py-2.5 text-sm text-gray-500">
              Đang suy nghĩ...
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-cream-dark bg-white px-3 py-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="rounded-full border border-primary/25 bg-primary-light px-3 py-1 text-xs text-primary transition hover:bg-primary/10 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <a
        href={STORE.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-2 border-t border-cream-dark bg-[#f0f7ff] px-3 py-2.5 text-xs transition hover:bg-[#e3efff]"
      >
        <span className="flex items-center gap-2 font-medium text-gray-700">
          <ZaloIcon size={22} />
          Liên hệ Zalo
        </span>
        <span className="font-semibold text-[#0068ff]">{STORE.zaloPhone}</span>
      </a>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex gap-2 border-t border-cream-dark bg-white p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
          className="min-w-0 flex-1 rounded-xl border border-cream-dark px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          Gửi
        </button>
      </form>
    </div>
  )
}
