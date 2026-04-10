'use client'

import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { useInviteMember } from '~/hooks/use-invitations'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface AddMemberModalProps {
  teamId: string
  onClose: () => void
}

export function AddMemberModal({ teamId, onClose }: AddMemberModalProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const inviteMember = useInviteMember(teamId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    inviteMember.mutate(email, {
      onSuccess: () => {
        setEmail('')
        onClose()
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border shadow-xl"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Invite member</h2>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }}>
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="member-email">Email address</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              disabled={inviteMember.isPending}
              autoFocus
            />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              They will receive an invitation to join this team.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={inviteMember.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMember.isPending} className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              {inviteMember.isPending ? 'Inviting…' : 'Invite member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
