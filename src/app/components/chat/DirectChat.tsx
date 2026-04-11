'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as Ably from 'ably'
import { ChatClient } from '@ably/chat'
import { ChatRoomProvider, ChatClientProvider, useMessages, useTyping, usePresence, usePresenceListener } from '@ably/chat/react'
import type { Message } from '@ably/chat'
import { Send, Phone, Video, Info } from 'lucide-react'
import { saveDirectMessage } from '~/server/actions/chat-actions'

interface DirectChatProps {
  conversationId: string
  currentUserId: string
  otherUser: { id: string; name: string; email: string; image: string | null }
}

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '✅', '😄', '🚀']

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateLabel(date: Date | string): string {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isSameDay(a: Date | string, b: Date | string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

// ── Inner Chat ──────────────────────────────────────────────────────────────

function DirectChatInner({ conversationId, currentUserId, otherUser }: DirectChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Ably Hooks ──
  const { sendMessage, history } = useMessages({
    listener: (event) => {
      const msg = event.message
      if ((event.type as string) === 'message.created') setMessages(p => [...p, msg])
    }
  })
  const { currentlyTyping, keystroke, stop } = useTyping()
  usePresence() 
  const { presenceData } = usePresenceListener()

  const isOtherOnline = presenceData.some(p => p.clientId === otherUser.id)

  // ── Load History ──
  useEffect(() => {
    async function load() {
      if (!history) return
      try {
        const result = await history({ limit: 50 })
        setMessages(result.items.reverse())
      } catch (err) { console.error('[DirectChat] History error:', err) }
    }
    void load()
  }, [history])

  // ── UI Effects ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  // ── Handlers ──
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    void stop().catch(console.error)
    try {
      await sendMessage({ text })
      saveDirectMessage(conversationId, text).catch(console.error)
    } catch (err) { console.error('[DirectChat] Send failed:', err) }
    finally { setSending(false); textareaRef.current?.focus() }
  }, [input, sending, sendMessage, stop, conversationId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend() }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            {otherUser.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={otherUser.image} alt={otherUser.name} className="h-10 w-10 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted text-sm font-bold shadow-sm">
                {otherUser.name[0]}
              </div>
            )}
            {isOtherOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500 shadow-sm" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold truncate leading-tight">{otherUser.name}</h2>
            <p className="text-[10px] font-medium" style={{ color: isOtherOnline ? '#22c55e' : 'var(--muted-foreground)' }}>
              {isOtherOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl transition-colors hover:bg-muted" style={{ color: 'var(--muted-foreground)' }}><Phone className="h-4.5 w-4.5" /></button>
          <button className="p-2 rounded-xl transition-colors hover:bg-muted" style={{ color: 'var(--muted-foreground)' }}><Video className="h-4.5 w-4.5" /></button>
          <button className="p-2 rounded-xl transition-colors hover:bg-muted" style={{ color: 'var(--muted-foreground)' }}><Info className="h-4.5 w-4.5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {messages.map((msg, idx) => {
          const prev = messages[idx-1]
          const isMine = msg.clientId === currentUserId
          const isFirstInGroup = prev?.clientId !== msg.clientId || !isSameDay(prev?.timestamp ?? new Date(), msg.timestamp ?? new Date())
          const showDateSep = !prev || !isSameDay(prev.timestamp ?? new Date(), msg.timestamp ?? new Date())

          return (
            <div key={msg.serial ?? idx}>
              {showDateSep && (
                <div className="flex items-center gap-3 my-6 opacity-60">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{formatDateLabel(msg.timestamp ?? new Date())}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-bottom-1 duration-300 ${isMine ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
                  style={{ 
                    borderBottomRightRadius: isMine ? '4px' : '16px',
                    borderBottomLeftRadius: isMine ? '16px' : '4px',
                    background: isMine ? 'linear-gradient(135deg, var(--primary), var(--secondary, var(--primary)))' : 'var(--muted)'
                  }}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                {isFirstInGroup && (
                  <span className="mt-1 text-[9px] font-medium opacity-50 px-1">
                    {formatTime(msg.timestamp ?? new Date())}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {Array.from(currentlyTyping).some(id => id === otherUser.id) && (
              <span className="flex items-center gap-1">
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                {otherUser.name} is typing…
              </span>
            )}
          </div>
          <div className="flex gap-1.5 opacity-80">
            {QUICK_EMOJIS.map(e => (
              <button 
                key={e} 
                onClick={() => setInput(p => p+e)}
                className="hover:scale-125 transition-transform text-base grayscale hover:grayscale-0"
              >{e}</button>
            ))}
          </div>
        </div>
        <div className="relative flex items-end gap-2 p-1.5 rounded-2xl border bg-background shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all" style={{ borderColor: 'var(--border)' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              const val = e.target.value
              setInput(val)
              if (val.trim()) void keystroke().catch(console.error)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 max-h-32 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:grayscale"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Shell ───────────────────────────────────────────────────────────────────

export function DirectChat({ conversationId, currentUserId, otherUser }: DirectChatProps) {
  const [chatClient, setChatClient] = useState<ChatClient | null>(null)

  useEffect(() => {
    const realtime = new Ably.Realtime({
      authCallback: (_tokenParams, callback) => {
        fetch('/api/ably-token', { credentials: 'include' })
          .then(async (res) => {
            if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
            callback(null, await res.text())
          })
          .catch((err) => callback(String(err), null))
      },
    })
    setChatClient(new ChatClient(realtime))
    return () => realtime.close()
  }, [])

  if (!chatClient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-sm gap-3" style={{ color: 'var(--muted-foreground)' }}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--primary)' }} />
        Secure connection...
      </div>
    )
  }

  return (
    <ChatClientProvider client={chatClient}>
      <ChatRoomProvider name={`direct:${conversationId}`}>
        <DirectChatInner
          conversationId={conversationId}
          currentUserId={currentUserId}
          otherUser={otherUser}
        />
      </ChatRoomProvider>
    </ChatClientProvider>
  )
}
