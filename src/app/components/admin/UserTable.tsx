'use client'

import { useState } from 'react'
import { Trash2, Shield, User as UserIcon } from 'lucide-react'
import { useDeleteUser } from '~/hooks/use-delete-user'
import { useUpdateUserRole } from '~/hooks/use-update-user-role'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface UserWithCounts {
  id: string
  name: string
  email: string
  role: string
  image: string | null
  createdAt: Date
  _count: { tasks: number; teamMembers: number }
}

interface UserTableProps {
  users: UserWithCounts[]
  currentUserId: string
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const deleteUser = useDeleteUser()
  const updateRole = useUpdateUserRole()

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-3">
      {/* Search */}
      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            No users found
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map((user) => {
              const isMe = user.id === currentUserId
              const isAdmin = user.role === 'admin'

              return (
                <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {user.name}
                        {isMe && (
                          <span className="ml-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            (you)
                          </span>
                        )}
                      </p>
                      <Badge
                        variant={isAdmin ? 'default' : 'secondary'}
                        className="text-xs capitalize"
                      >
                        {isAdmin ? <Shield className="mr-1 h-3 w-3" /> : <UserIcon className="mr-1 h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {user.email} · {user._count.tasks} tasks · {user._count.teamMembers} teams
                    </p>
                  </div>

                  {/* Joined */}
                  <span className="hidden sm:block shrink-0 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  {/* Actions — disabled for self */}
                  {!isMe && (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateRole.mutate({ userId: user.id, role: isAdmin ? 'user' : 'admin' })
                        }
                        disabled={updateRole.isPending}
                        className="text-xs"
                      >
                        {isAdmin ? 'Demote' : 'Make Admin'}
                      </Button>

                      {confirmDeleteId === user.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              deleteUser.mutate(user.id)
                              setConfirmDeleteId(null)
                            }}
                            disabled={deleteUser.isPending}
                            className="text-xs"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDeleteId(user.id)}
                          style={{ color: 'var(--destructive)' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
