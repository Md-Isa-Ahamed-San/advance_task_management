import { redirect } from 'next/navigation'
import { getSession } from '~/server/better-auth/server'
import { db } from '~/server/db'
import { getDirectInvitationCount } from '~/server/actions/chat-actions'
import { DashboardLayoutClient } from '@/app/components/dashboard/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) redirect('/login')

  const [me, inviteCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    }),
    getDirectInvitationCount()
  ])
  const isAdmin = me?.role === 'admin'

  return (
    <DashboardLayoutClient
      userName={session.user.name}
      userEmail={session.user.email}
      userImage={session.user.image ?? undefined}
      isAdmin={isAdmin}
      chatInviteCount={inviteCount}
    >
      {children}
    </DashboardLayoutClient>
  )
}
