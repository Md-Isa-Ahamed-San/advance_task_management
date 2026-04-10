'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { deleteUser } from '~/server/actions/admin-actions'

export function useDeleteUser() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted')
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      router.refresh()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
