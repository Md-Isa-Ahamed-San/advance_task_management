'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sendMessage } from '~/server/actions/team-actions'

export function useSendMessage(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => sendMessage(teamId, content),
    onSuccess: () => {
      // Invalidate message cache to trigger refetch
      void queryClient.invalidateQueries({ queryKey: ['messages', teamId] })
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to send message'),
  })
}
