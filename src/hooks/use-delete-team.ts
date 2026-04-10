'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteTeam } from '~/server/actions/team-actions'

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: () => {
      toast.success('Team deleted')
      void queryClient.invalidateQueries({ queryKey: ['teams'] })
      router.refresh()
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to delete team'),
  })
}
