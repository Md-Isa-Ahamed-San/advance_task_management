'use client'

import { useMemo } from 'react'
import * as Ably from 'ably'
import { ChatClient } from '@ably/chat'
import { ChatClientProvider } from '@ably/chat/react'

/**
 * Wraps the app with Ably ChatClientProvider.
 * The Realtime client and ChatClient are created ONCE in useMemo —
 * never inside render, to avoid connection leaks (Ably skill rule).
 *
 * Auth: token-based via /api/ably-token (JWT). API key never touches client.
 */
export function AblyChatProvider({ children }: { children: React.ReactNode }) {
  const realtimeClient = useMemo(
    () =>
      new Ably.Realtime({
        authCallback: (_tokenParams, callback) => {
          fetch('/api/ably-token', { credentials: 'include' })
            .then(async (response) => {
              if (!response.ok) throw new Error(`Auth failed: ${response.status}`)
              const token = await response.text()
              callback(null, token)
            })
            .catch((err) => {
              callback(String(err), null)
            })
        },
      }),
    [],
  )

  const chatClient = useMemo(() => new ChatClient(realtimeClient), [realtimeClient])

  return (
    <ChatClientProvider client={chatClient}>
      {children}
    </ChatClientProvider>
  )
}
