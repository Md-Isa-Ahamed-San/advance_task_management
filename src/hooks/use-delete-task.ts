'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteTask } from '~/server/actions/task-actions'

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.success('Task deleted')
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.refresh()
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete task')
    },
  })
}
