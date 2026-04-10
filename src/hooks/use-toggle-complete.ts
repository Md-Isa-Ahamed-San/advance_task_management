'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { toggleComplete } from '~/server/actions/task-actions'

export function useToggleComplete() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => toggleComplete(id),
    onSuccess: (data) => {
      const label = data.task.completed ? 'Task completed! 🎉' : 'Task marked incomplete'
      toast.success(label)
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.refresh()
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update task')
    },
  })
}
