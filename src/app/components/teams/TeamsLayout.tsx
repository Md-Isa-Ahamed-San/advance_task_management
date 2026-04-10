'use client'

import { useState } from 'react'
import { TeamCard } from './TeamCard'
import { CreateTeamButton } from './TeamForm'
import { MemberList } from './MemberList'
import { AddMemberModal } from './AddMemberModal'
import { Trash2, UserPlus, Users, MessageCircle, ClipboardList } from 'lucide-react'
import { TeamTasksTab } from './TeamTasksTab'
import type { MemberRole } from '../../../../generated/prisma'
import { useDeleteTeam } from '../../../hooks/use-delete-team'
import { Button } from '../ui/button'
import { TeamChat } from './TeamChat'
import { JoinTeamModal } from './JoinTeamModal'
import { useGenerateInviteCode } from '~/hooks/use-generate-invite-code'
import { Ticket, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { InvitationList } from './InvitationList'


interface TeamMemberWithUser {
  role: MemberRole
  joinedAt: Date
  userId: string
  user: { id: string; name: string; email: string; image: string | null }
}

interface Team {
  id: string
  name: string
  inviteCode?: string | null
  _count: { tasks: number; messages: number }
  members: TeamMemberWithUser[]
}

interface TeamsLayoutProps {
  teams: Team[]
  currentUserId: string
}

type ActiveTab = 'members' | 'tasks' | 'chat'

export function TeamsLayout({ teams, currentUserId }: TeamsLayoutProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    teams[0]?.id ?? null,
  )
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [joinTeamOpen, setJoinTeamOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks')

  const deleteTeam = useDeleteTeam()
  const generateCode = useGenerateInviteCode()

  const [copied, setCopied] = useState(false)

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null
  const myRole =
    selectedTeam?.members.find((m) => m.userId === currentUserId)?.role ?? 'MEMBER'
  const canManage = myRole === 'OWNER' || myRole === 'ADMIN'

  const copyToClipboard = (code: string) => {
    void navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Invite code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full max-w-[1400px] mx-auto">
      {/* Sidebar — team list */}
      <div
        className={`flex shrink-0 flex-col md:border-r ${selectedTeamId ? 'hidden md:flex md:w-72' : 'w-full md:w-72'}`}
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Teams</h2>
          <div className="flex gap-1.5">
            <button
              onClick={() => setJoinTeamOpen(true)}
              className="flex items-center justify-center p-1.5 rounded-lg border hover:bg-muted transition-colors"
              title="Join team"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              <Ticket className="h-4 w-4" />
            </button>
            <CreateTeamButton />
          </div>
        </div>

        {/* Invitations Section */}
        <InvitationList />

        {/* Team list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {teams.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                No teams yet. Create one!
              </p>
            </div>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                currentUserId={currentUserId}
                isSelected={team.id === selectedTeamId}
                onClick={() => setSelectedTeamId(team.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Main panel */}
      {selectedTeam ? (
        <div className={`flex flex-1 flex-col overflow-hidden ${selectedTeamId ? 'flex' : 'hidden md:flex'}`}>
          {/* Team header */}
          <div
            className="flex items-center justify-between border-b px-4 md:px-6 py-4 gap-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTeamId(null)}
                className="md:hidden flex items-center justify-center p-2 -ml-2 rounded-lg hover:bg-muted"
                aria-label="Back to teams"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {selectedTeam.name}
                </h1>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {selectedTeam.members.length} member{selectedTeam.members.length !== 1 ? 's' : ''}
                  {' · '}
                  {myRole.toLowerCase()}
                  {canManage && selectedTeam.inviteCode && (
                    <button
                      onClick={() => copyToClipboard(selectedTeam.inviteCode!)}
                      className="ml-2 group flex items-center gap-1.5 font-mono text-[10px] bg-muted hover:bg-muted/80 px-2 py-0.5 rounded border border-border transition-colors"
                      title="Click to copy invite code"
                    >
                      Code: {selectedTeam.inviteCode}
                      {copied ? (
                        <Check className="h-2.5 w-2.5 text-green-500" />
                      ) : (
                        <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddMemberOpen(true)}
                  className="gap-1.5 px-2 md:px-3"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add member</span>
                </Button>
              )}
              {canManage && !selectedTeam.inviteCode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateCode.mutate(selectedTeam.id)}
                  disabled={generateCode.isPending}
                  className="gap-1.5 px-2 md:px-3"
                  title="Generate invite code"
                >
                  <Ticket className="h-4 w-4" />
                  <span className="hidden sm:inline">Get Code</span>
                </Button>
              )}
              {myRole === 'OWNER' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Delete "${selectedTeam.name}"? This cannot be undone.`)) {
                      deleteTeam.mutate(selectedTeam.id, {
                        onSuccess: () => setSelectedTeamId(teams.find((t) => t.id !== selectedTeam.id)?.id ?? null),
                      })
                    }
                  }}
                  disabled={deleteTeam.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-6 overflow-x-auto no-scrollbar shrink-0" style={{ borderColor: 'var(--border)' }}>
            {(['tasks', 'members', 'chat'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 border-b-2 px-1 py-3 mr-6 text-sm font-medium capitalize transition-colors shrink-0"
                style={{
                  borderColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                {tab === 'members' ? <Users className="h-4 w-4" /> : tab === 'tasks' ? <ClipboardList className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'members' ? (
              <div className="p-6 overflow-y-auto h-full">
                <MemberList
                  members={selectedTeam.members}
                  currentUserId={currentUserId}
                  currentUserRole={myRole}
                  teamId={selectedTeam.id}
                />
              </div>
            ) : activeTab === 'tasks' ? (
              <TeamTasksTab teamId={selectedTeam.id} />
            ) : (
              <TeamChat teamId={selectedTeam.id} currentUserId={currentUserId} members={selectedTeam.members} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Select a team or create a new one
          </p>
        </div>
      )}

      {/* Modals */}
      {addMemberOpen && selectedTeam && (
        <AddMemberModal teamId={selectedTeam.id} onClose={() => setAddMemberOpen(false)} />
      )}
      {joinTeamOpen && (
        <JoinTeamModal onClose={() => setJoinTeamOpen(false)} />
      )}
    </div>
  )
}
