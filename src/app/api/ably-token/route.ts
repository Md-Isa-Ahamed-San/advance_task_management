import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getSession } from '~/server/better-auth/server'

/**
 * GET /api/ably-token
 * Returns a signed JWT for the current user.
 * The API key stays server-side only — never exposed to the client.
 */
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ABLY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Ably API key not configured' }, { status: 500 })
  }

  const [keyName, keySecret] = apiKey.split(':')

  if (!keyName || !keySecret) {
    return NextResponse.json({ error: 'Invalid Ably API key format' }, { status: 500 })
  }

  const token = jwt.sign(
    {
      // Scope: access all team rooms + publish/subscribe/presence/history
      'x-ably-capability': JSON.stringify({
        'team:*': ['publish', 'subscribe', 'presence', 'history'],
      }),
      // clientId = user's DB id — required for presence & identity
      'x-ably-clientId': session.user.id,
    },
    keySecret,
    {
      expiresIn: '1h',
      keyid: keyName,
    },
  )

  // Return plain text — Ably expects a raw JWT string
  return new Response(token, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
