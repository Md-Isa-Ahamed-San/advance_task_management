'use client'

import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useJoinTeam } from '~/hooks/use-join-team'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface JoinTeamModalProps {
  onClose: () => void
}

export function JoinTeamModal({ onClose }: JoinTeamModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const joinTeam = useJoinTeam()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter an invite code')
      return
    }

    joinTeam.mutate(code, {
      onSuccess: () => {
        onClose()
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Join Team</h2>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-lg border px-3 py-2 text-sm text-center"
              style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)', backgroundColor: 'color-mix(in srgb, var(--destructive) 10%, transparent)' }}>
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="E.G. AB12CD34"
              disabled={joinTeam.isPending}
              autoFocus
              className="text-center font-mono tracking-widest uppercase"
            />
            <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
              Ask your team owner for the 8-character invite code.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={joinTeam.isPending} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={joinTeam.isPending} className="flex-1 gap-1.5">
              <UserPlus className="h-4 w-4" />
              {joinTeam.isPending ? 'Joining…' : 'Join Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
