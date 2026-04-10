'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateUserRole } from '~/server/actions/admin-actions'

export function useUpdateUserRole() {
  const router = useRouter()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('Role updated')
      router.refresh()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
