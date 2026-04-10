import { getSession } from '~/server/better-auth/server'
import { getTeams } from '~/server/queries/teams'
import { TeamsLayout } from '@/app/components/teams/TeamsLayout'

export const metadata = {
  title: 'Teams — TaskFlow',
}

export default async function TeamsPage() {
  const session = await getSession()
  const teams = await getTeams(session!.user.id)

  return (
    <div className="h-full">
      <TeamsLayout
        teams={teams}
        currentUserId={session!.user.id}
      />
    </div>
  )
}
