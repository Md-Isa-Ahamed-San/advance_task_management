'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { useCreateTeam } from '~/hooks/use-create-team'
import { useUpdateTeam } from '~/hooks/use-update-team'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface TeamFormProps {
  team?: { id: string; name: string }
  onClose: () => void
}

export function TeamForm({ team, onClose }: TeamFormProps) {
  const isEdit = !!team
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()

  const [name, setName] = useState(team?.name ?? '')
  const [error, setError] = useState('')
  const isPending = createTeam.isPending || updateTeam.isPending

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Team name is required'); return }
    setError('')

    if (isEdit) {
      updateTeam.mutate({ teamId: team.id, name }, { onSuccess: onClose })
    } else {
      createTeam.mutate({ name }, { onSuccess: onClose })
    }
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
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            {isEdit ? 'Rename team' : 'New team'}
          </h2>
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
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team"
              disabled={isPending}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Rename' : 'Create team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CreateTeamButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
        <Plus className="h-4 w-4" />
        New team
      </Button>
      {open && <TeamForm onClose={() => setOpen(false)} />}
    </>
  )
}
