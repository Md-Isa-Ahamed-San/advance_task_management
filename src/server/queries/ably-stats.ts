import { unstable_cache } from 'next/cache'
import Ably from 'ably'

export type AblyStats = {
  messagesThisMonth: number
  messagesToday: number
  limit: number
  remaining: number
  percentUsed: number
  cachedAt: string
}

/**
 * Fetches real message usage stats from Ably's Stats API.
 * Uses Ably.Rest (server-side only) — API key never touches the client.
 * Cached for 6 hours (21600 seconds) to avoid hammering the Ably API.
 */
export const getAblyStats = unstable_cache(
  async (): Promise<AblyStats> => {
    const apiKey = process.env.ABLY_API_KEY
    if (!apiKey) {
      return {
        messagesThisMonth: 0,
        messagesToday: 0,
        limit: 6_000_000,
        remaining: 6_000_000,
        percentUsed: 0,
        cachedAt: new Date().toISOString(),
      }
    }

    try {
      // Use REST SDK — stateless HTTP, no WebSocket needed server-side
      const rest = new Ably.Rest({ key: apiKey })

      const [monthPage, dayPage] = await Promise.all([
        rest.stats({ unit: 'month', limit: 1, direction: 'backwards' } as Parameters<typeof rest.stats>[0]),
        rest.stats({ unit: 'day',   limit: 1, direction: 'backwards' } as Parameters<typeof rest.stats>[0]),
      ])

      type AblyStatItem = {
        inbound?: { all?: { messages?: { count?: number } } }
      }

      const month = monthPage.items[0] as unknown as AblyStatItem
      const day   = dayPage.items[0] as unknown as AblyStatItem

      // Ably free tier: 6,000,000 messages/month
      // Override via ABLY_MONTHLY_LIMIT env var if on a paid plan
      const LIMIT = Number(process.env.ABLY_MONTHLY_LIMIT ?? 6_000_000)

      // inbound.all.messages.count = messages published by clients into Ably
      const used = month?.inbound?.all?.messages?.count ?? 0
      const today = day?.inbound?.all?.messages?.count ?? 0

      return {
        messagesThisMonth: used,
        messagesToday:     today,
        limit:             LIMIT,
        remaining:         Math.max(0, LIMIT - used),
        percentUsed:       Math.min(100, Math.round((used / LIMIT) * 100)),
        cachedAt:          new Date().toISOString(),
      }
    } catch (err) {
      console.error('[getAblyStats] Failed to fetch Ably stats:', err)
      return {
        messagesThisMonth: -1, // -1 signals fetch error in UI
        messagesToday: -1,
        limit: 6_000_000,
        remaining: -1,
        percentUsed: 0,
        cachedAt: new Date().toISOString(),
      }
    }
  },
  ['ably-stats'],
  { tags: ['ably-stats'], revalidate: 21_600 }, // 6 hours
)
