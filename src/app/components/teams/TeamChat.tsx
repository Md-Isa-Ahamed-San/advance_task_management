'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as Ably from 'ably'
import { ChatClient } from '@ably/chat'
import { ChatRoomProvider, ChatClientProvider } from '@ably/chat/react'
import { useMessages, useTyping, usePresence, usePresenceListener } from '@ably/chat/react'
import type { Message } from '@ably/chat'
import { Send } from 'lucide-react'
import { saveTeamMessage } from '~/server/actions/team-actions'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TeamMember {
  userId: string
  user: { id: string; name: string; email: string; image: string | null }
}

interface TeamChatProps {
  teamId: string
  currentUserId: string
  members: TeamMember[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#22c55e', '#06b6d4', '#eab308', '#ef4444',
]
function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]!
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 8 }: { name: string; size?: number }) {
  const color = avatarColor(name)
  return (
    <div
      className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full text-xs font-bold text-white`}
      style={{ backgroundColor: color, fontSize: size < 8 ? '10px' : '12px' }}
    >
      {getInitials(name)}
    </div>
  )
}

// ── Date Separator ────────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
      <span className="text-[11px] font-medium px-2" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
    </div>
  )
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isMine,
  isFirst,
  isLast,
  senderName,
}: {
  msg: Message
  isMine: boolean
  isFirst: boolean
  isLast: boolean
  senderName: string
}) {
  const [showTime, setShowTime] = useState(false)

  return (
    <div className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${isFirst ? 'mt-3' : 'mt-0.5'}`}>
      {/* Avatar — only on first in group, others side gets a spacer */}
      {!isMine ? (
        isFirst ? (
          <Avatar name={senderName} size={8} />
        ) : (
          <div className="w-8 shrink-0" />
        )
      ) : null}

      <div className={`flex max-w-[72%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Name + time header — only first in group */}
        {isFirst && !isMine && (
          <p className="mb-1 text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
            {senderName}
          </p>
        )}

        {/* Bubble */}
        <div
          className="group relative cursor-default rounded-2xl px-3.5 py-2 text-sm leading-relaxed"
          style={{
            backgroundColor: isMine
              ? 'var(--primary)'
              : 'var(--muted)',
            color: isMine ? '#fff' : 'var(--foreground)',
            borderBottomRightRadius: isMine && !isLast ? '6px' : undefined,
            borderBottomLeftRadius:  !isMine && !isLast ? '6px' : undefined,
          }}
          onMouseEnter={() => setShowTime(true)}
          onMouseLeave={() => setShowTime(false)}
        >
          <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {msg.text}
          </span>

          {/* Hover timestamp tooltip */}
          {showTime && (
            <span
              className={`absolute -top-6 text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${isMine ? 'right-0' : 'left-0'}`}
              style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
            >
              {formatTime(msg.timestamp ?? new Date())}
            </span>
          )}
        </div>

        {/* Timestamp — always visible on last message in group */}
        {isLast && (
          <p className="mt-0.5 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            {formatTime(msg.timestamp ?? new Date())}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Online Presence Pill ──────────────────────────────────────────────────────

function OnlinePill({ count, names }: { count: number; names: string[] }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
      style={{ borderColor: 'color-mix(in srgb, #22c55e 30%, var(--border))', color: '#16a34a', backgroundColor: 'color-mix(in srgb, #22c55e 8%, var(--card))' }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
      {count} online
      {names.length > 0 && (
        <span className="hidden sm:inline" style={{ color: 'var(--muted-foreground)' }}>
          · {names.slice(0, 2).join(', ')}{names.length > 2 ? ` +${names.length - 2}` : ''}
        </span>
      )}
    </div>
  )
}

// ── Inner Chat (must be inside ChatRoomProvider) ───────────────────────────────

function TeamChatInner({
  teamId,
  currentUserId,
  members,
}: {
  teamId: string
  currentUserId: string
  members: TeamMember[]
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Map clientId → display name from team members
  const memberMap = Object.fromEntries(members.map((m) => [m.userId, m.user.name]))

  // ── Ably Chat: Messages ───────────────────────────────────────────────────
  const { sendMessage, history } = useMessages({
    listener: (event) => {
      const msg = event.message
      // Use string comparison for type to avoid import issues
      if ((event.type as string) === 'message.created') {
        setMessages((prev) => [...prev, msg])
      } else if ((event.type as string) === 'message.updated') {
        setMessages((prev) =>
          prev.map((m) => (m.serial === msg.serial ? msg : m)),
        )
      }
    },
  })

  // ── Ably Chat: Typing ─────────────────────────────────────────────────────
  const { currentlyTyping, keystroke, stop } = useTyping()

  // ── Ably Chat: Presence ───────────────────────────────────────────────────
  usePresence() // name mapped client-side via memberMap
  const { presenceData } = usePresenceListener()

  const onlineNames = presenceData
    .filter((p) => p.clientId !== currentUserId)
    .map((p) => memberMap[p.clientId] ?? p.clientId)
  const onlineCount = presenceData.length

  // ── Load history on mount ─────────────────────────────────────────────────
  useEffect(() => {
    async function loadHistory() {
      if (!history) return
      try {
        const result = await history({ limit: 50 })
        setMessages(result.items.reverse()) // oldest first
      } catch (err) {
        console.error('[TeamChat] Failed to load history:', err)
      }
    }
    void loadHistory()
  }, [history])

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setInput('')
    void stop().catch(console.error)

    try {
      await sendMessage({ text })
      // Persist to DB after Ably delivers (fire-and-forget)
      saveTeamMessage(teamId, text).catch(console.error)
    } catch (err) {
      console.error('[TeamChat] Send failed:', err)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }, [input, sending, sendMessage, stop, teamId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length > 500) return
    setInput(val)
    if (val.trim().length > 0) {
      void keystroke().catch(console.error)
    } else {
      void stop().catch(console.error)
    }
  }

  // ── Typing indicator display ──────────────────────────────────────────────
  const typingNames = Array.from(currentlyTyping)
    .filter((id) => id !== currentUserId)
    .map((id) => memberMap[id] ?? id)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Online presence bar */}
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
          📡 Live chat ·
        </p>
        <OnlinePill count={onlineCount} names={onlineNames} />
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              💬
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                No messages yet
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Be the first to say something!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prev = messages[idx - 1]
            const next = messages[idx + 1]
            const isMine      = msg.clientId === currentUserId
            const isFirst     = prev?.clientId !== msg.clientId || !isSameDay(prev.timestamp ?? new Date(), msg.timestamp ?? new Date())
            const isLast      = next?.clientId !== msg.clientId || !isSameDay(msg.timestamp ?? new Date(), next.timestamp ?? new Date())
            const showDateSep = !prev || !isSameDay(prev.timestamp ?? new Date(), msg.timestamp ?? new Date())
            const senderName  = memberMap[msg.clientId] ?? msg.clientId

            return (
              <div key={msg.serial ?? idx}>
                {showDateSep && (
                  <DateSeparator label={formatDateLabel(msg.timestamp ?? new Date())} />
                )}
                <MessageBubble
                  msg={msg}
                  isMine={isMine}
                  isFirst={isFirst}
                  isLast={isLast}
                  senderName={senderName}
                />
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div
        className="min-h-[22px] px-4 text-xs"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {typingNames.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="flex gap-0.5">
              <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: '0ms' }} />
              <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: '150ms' }} />
              <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-current" style={{ animationDelay: '300ms' }} />
            </span>
            {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing…
          </span>
        )}
      </div>

      {/* Input area */}
      <div
        className="border-t px-4 pb-4 pt-2"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        {/* Quick emoji row */}
        <div className="mb-2 flex gap-1">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setInput((p) => (p.length < 498 ? p + emoji : p))}
              className="rounded-lg px-1.5 py-1 text-base transition-all hover:scale-110 hover:bg-muted"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Textarea + send */}
        <div className="flex items-end gap-2">
          <div
            className="flex flex-1 items-end rounded-2xl border px-3 py-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
          >
            <textarea
              ref={textareaRef}
              id="team-chat-input"
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full resize-none bg-transparent text-sm outline-none"
              style={{ color: 'var(--foreground)', maxHeight: '120px' }}
            />
            <span
              className="ml-2 shrink-0 self-end text-[10px] tabular-nums"
              style={{ color: input.length > 450 ? 'var(--destructive)' : 'var(--muted-foreground)' }}
            >
              {input.length}/500
            </span>
          </div>

          <button
            id="team-chat-send"
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary, var(--primary)))',
            }}
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Public export — wraps inner in ChatRoomProvider ───────────────────────────

export function TeamChat({ teamId, currentUserId, members }: TeamChatProps) {
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

    return () => {
      realtime.close()
    }
  }, [])

  if (!chatClient) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
        <p className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          Connecting to chat...
        </p>
      </div>
    )
  }

  return (
    <ChatClientProvider client={chatClient}>
      <ChatRoomProvider name={`team:${teamId}`}>
        <TeamChatInner
          teamId={teamId}
          currentUserId={currentUserId}
          members={members}
        />
      </ChatRoomProvider>
    </ChatClientProvider>
  )
}
