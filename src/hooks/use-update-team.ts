'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateTeam } from '~/server/actions/team-actions'

export function useUpdateTeam() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: ({ teamId, name }: { teamId: string; name: string }) =>
      updateTeam(teamId, { name }),
    onSuccess: () => {
      toast.success('Team updated')
      void queryClient.invalidateQueries({ queryKey: ['teams'] })
      router.refresh()
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to update team'),
  })
}
