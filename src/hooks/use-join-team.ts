'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { joinTeamWithCode } from '~/server/actions/team-actions'

export function useJoinTeam() {
  const router = useRouter()
  return useMutation({
    mutationFn: (inviteCode: string) => joinTeamWithCode(inviteCode),
    onSuccess: (data) => {
      toast.success('Successfully joined the team!')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to join team')
    },
  })
}
