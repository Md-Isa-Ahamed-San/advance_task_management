import { unstable_cache } from 'next/cache'
import Ably from 'ably'

export type AblyStats = {
  messagesThisMonth: number
  messagesToday: number
  limit: number
  remaining: number
  percentUsed: number
  cachedAt: string
  status: 'ok' | 'error' | 'permission_denied'
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
        status: 'error',
      }
    }

    try {
      // Use REST SDK — stateless HTTP, no WebSocket needed server-side
      const rest = new Ably.Rest({
        key: apiKey,
        logLevel: 1, // Only log errors, suppress warnings (like permission issues)
      })

      const [monthPage, dayPage] = await Promise.all([
        rest.stats({ unit: 'month', limit: 1, direction: 'backwards' } as Parameters<typeof rest.stats>[0]),
        rest.stats({ unit: 'day',   limit: 1, direction: 'backwards' } as Parameters<typeof rest.stats>[0]),
      ])

      type AblyStatItem = {
        inbound?: { all?: { messages?: { count?: number } } }
      }

      const month = monthPage.items[0] as unknown as AblyStatItem
      const day   = dayPage.items[0] as unknown as AblyStatItem

      const LIMIT = Number(process.env.ABLY_MONTHLY_LIMIT ?? 6_000_000)
      const used = month?.inbound?.all?.messages?.count ?? 0
      const today = day?.inbound?.all?.messages?.count ?? 0

      return {
        messagesThisMonth: used,
        messagesToday:     today,
        limit:             LIMIT,
        remaining:         Math.max(0, LIMIT - used),
        percentUsed:       Math.min(100, Math.round((used / LIMIT) * 100)),
        cachedAt:          new Date().toISOString(),
        status:            'ok',
      }
    } catch (err: unknown) {
      // Ably error 40160 = "action not permitted" (missing statistics capability)
      const error = err as { code?: number; statusCode?: number }
      const isPermissionDenied = error.code === 40160 || error.statusCode === 401

      if (isPermissionDenied) {
        console.warn('[getAblyStats] Ably API key lacks "statistics" capability.')
      } else {
        console.error('[getAblyStats] Failed to fetch Ably stats:', err)
      }

      return {
        messagesThisMonth: -1,
        messagesToday: -1,
        limit: 6_000_000,
        remaining: -1,
        percentUsed: 0,
        cachedAt: new Date().toISOString(),
        status: isPermissionDenied ? 'permission_denied' : 'error',
      }
    }
  },
  ['ably-stats'],
  { tags: ['ably-stats'], revalidate: 21_600 }, // 6 hours
)
