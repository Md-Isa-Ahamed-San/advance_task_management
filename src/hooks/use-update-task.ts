'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateTask } from '~/server/actions/task-actions'
import type { UpdateTaskInput } from '~/server/actions/task-actions'

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      updateTask(id, data),
    onSuccess: () => {
      toast.success('Task updated')
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.refresh()
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update task')
    },
  })
}
