'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addMember } from '~/server/actions/team-actions'

export function useAddMember(teamId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (email: string) => addMember(teamId, email),
    onSuccess: () => {
      toast.success('Member added')
      void queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
      router.refresh()
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to add member'),
  })
}
