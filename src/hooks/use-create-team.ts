'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createTeam } from '~/server/actions/team-actions'
import type { CreateTeamInput } from '~/server/actions/team-actions'

export function useCreateTeam() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (data: CreateTeamInput) => createTeam(data),
    onSuccess: () => {
      toast.success('Team created')
      void queryClient.invalidateQueries({ queryKey: ['teams'] })
      router.refresh()
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to create team'),
  })
}
