'use client'

import { useState, useTransition } from 'react'
import { Search, Shield, User as UserIcon, Trash2, ArrowUpDown } from 'lucide-react'
import { deleteUser, updateUserRole } from '~/server/actions/admin-actions'
import type { UserWithTaskStats } from '~/server/queries/admin'
import { toast } from 'sonner'

interface UsersTabProps {
  users: UserWithTaskStats[]
  currentUserId: string
}

type SortKey = 'name' | 'taskCount' | 'completedCount' | 'overdueCount' | 'createdAt'

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

export function UsersTab({ users, currentUserId }: UsersTabProps) {
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = users
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const av = sortKey === 'name' ? a.name : sortKey === 'createdAt' ? a.createdAt.getTime() : a[sortKey]
      const bv = sortKey === 'name' ? b.name : sortKey === 'createdAt' ? b.createdAt.getTime() : b[sortKey]
      if (typeof av === 'string') return sortAsc ? av.localeCompare(String(bv)) : String(bv).localeCompare(av)
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av)
    })

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((p) => !p)
    else { setSortKey(key); setSortAsc(false) }
  }

  function handleRoleToggle(userId: string, isAdmin: boolean) {
    startTransition(async () => {
      try {
        await updateUserRole(userId, isAdmin ? 'user' : 'admin')
        toast.success(`Role updated`)
      } catch {
        toast.error('Failed to update role')
      }
    })
  }

  function handleDelete(userId: string) {
    startTransition(async () => {
      try {
        await deleteUser(userId)
        toast.success('User deleted')
        setConfirmId(null)
      } catch {
        toast.error('Failed to delete user')
      }
    })
  }

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(col)}
      className="flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-70"
      style={{ color: sortKey === col ? 'var(--foreground)' : 'var(--muted-foreground)' }}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm transition-all focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
          />
        </div>
        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length} of {users.length} users
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="min-w-[800px]">
          {/* Header */}
        <div
          className="grid items-center gap-3 border-b px-5 py-3"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto', borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
        >
          <SortBtn col="name" label="User" />
          <SortBtn col="taskCount" label="Total" />
          <SortBtn col="completedCount" label="Done" />
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Active</span>
          <SortBtn col="overdueCount" label="Overdue" />
          <SortBtn col="createdAt" label="Joined" />
          <span />
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No users found</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map((user) => {
              const isMe    = user.id === currentUserId
              const isAdmin = user.role === 'admin'
              const avatarColors = ['#6366f1', '#f97316', '#10b981', '#f43f5e', '#8b5cf6', '#0ea5e9']
              const avatarBg    = avatarColors[(user.name.charCodeAt(0) ?? 0) % avatarColors.length]!

              return (
                <div
                  key={user.id}
                  className="grid items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto' }}
                >
                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: avatarBg }}
                      >
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {user.name}
                          {isMe && <span className="ml-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>(you)</span>}
                        </p>
                        <span
                          className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: isAdmin
                              ? 'color-mix(in srgb, #f97316 15%, transparent)'
                              : 'var(--muted)',
                            color: isAdmin ? '#f97316' : 'var(--muted-foreground)',
                          }}
                        >
                          {isAdmin ? <Shield className="h-2.5 w-2.5" /> : <UserIcon className="h-2.5 w-2.5" />}
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>{user.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{user.taskCount}</span>
                  <span className="text-sm tabular-nums" style={{ color: '#22c55e' }}>{user.completedCount}</span>
                  <span className="text-sm tabular-nums" style={{ color: 'var(--primary)' }}>{user.activeCount}</span>
                  <span className="text-sm tabular-nums" style={{ color: user.overdueCount > 0 ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
                    {user.overdueCount}
                  </span>

                  {/* Joined */}
                  <span className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 justify-end">
                    {!isMe && (
                      <>
                        <button
                          onClick={() => handleRoleToggle(user.id, isAdmin)}
                          disabled={isPending}
                          className="rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all hover:opacity-80"
                          style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
                        >
                          {isAdmin ? 'Demote' : 'Make Admin'}
                        </button>

                        {confirmId === user.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={isPending}
                              className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                              style={{ backgroundColor: 'var(--destructive)', color: 'white' }}
                            >Confirm</button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="rounded-lg border px-2.5 py-1 text-[11px]"
                              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                            >Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(user.id)}
                            className="rounded-lg p-1.5 transition-colors hover:opacity-70"
                            style={{ color: 'var(--destructive)' }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
