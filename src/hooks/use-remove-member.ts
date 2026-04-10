'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { removeMember } from '~/server/actions/team-actions'

export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (userId: string) => removeMember(teamId, userId),
    onSuccess: () => {
      toast.success('Member removed')
      void queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
      router.refresh()
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to remove member'),
  })
}
