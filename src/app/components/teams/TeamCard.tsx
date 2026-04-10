import { Users, CheckSquare, MessageCircle } from 'lucide-react'
import { Badge } from '../ui/badge'
import type { MemberRole } from '../../../../generated/prisma'

interface TeamCardProps {
  team: {
    id: string
    name: string
    _count: { tasks: number; messages: number }
    members: {
      role: MemberRole
      user: { id: string; name: string; email: string; image: string | null }
    }[]
  }
  currentUserId: string
  isSelected: boolean
  onClick: () => void
}

const ROLE_COLOR: Record<MemberRole, string> = {
  OWNER: 'var(--primary)',
  ADMIN: 'var(--chart-3)',
  MEMBER: 'var(--muted-foreground)',
}

export function TeamCard({ team, currentUserId, isSelected, onClick }: TeamCardProps) {
  const myRole = team.members.find((m) => m.user.id === currentUserId)?.role ?? 'MEMBER'

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border p-4 text-left transition-all"
      style={{
        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
        backgroundColor: isSelected ? 'var(--accent)' : 'var(--card)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--foreground)' }}>
          {team.name}
        </p>
        <Badge
          className="text-xs shrink-0"
          style={{ color: ROLE_COLOR[myRole], backgroundColor: 'transparent', border: `1px solid ${ROLE_COLOR[myRole]}` }}
        >
          {myRole.toLowerCase()}
        </Badge>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <CheckSquare className="h-3.5 w-3.5" />
          {team._count.tasks} task{team._count.tasks !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {team._count.messages}
        </span>
      </div>

      {/* Member avatars */}
      <div className="mt-3 flex -space-x-2">
        {team.members.slice(0, 5).map((m) => (
          <div
            key={m.user.id}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold"
            style={{
              borderColor: isSelected ? 'var(--accent)' : 'var(--card)',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
            title={m.user.name}
          >
            {m.user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {team.members.length > 5 && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs"
            style={{ borderColor: 'var(--card)', backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            +{team.members.length - 5}
          </div>
        )}
      </div>
    </button>
  )
}
