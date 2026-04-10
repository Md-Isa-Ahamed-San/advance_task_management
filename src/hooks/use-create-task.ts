'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createTask } from '~/server/actions/task-actions'
import type { CreateTaskInput } from '~/server/actions/task-actions'

export function useCreateTask() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(data),
    onSuccess: () => {
      toast.success('Task created')
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.refresh()
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to create task')
    },
  })
}
