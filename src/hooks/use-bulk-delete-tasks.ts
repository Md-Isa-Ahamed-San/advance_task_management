'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { bulkDeleteTasks } from '~/server/actions/task-actions'

export function useBulkDeleteTasks() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteTasks(ids),
    onSuccess: (data) => {
      toast.success(`${data.count} task${data.count === 1 ? '' : 's'} deleted`)
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.refresh()
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete tasks')
    },
  })
}
