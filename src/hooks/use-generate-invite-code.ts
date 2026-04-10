'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { generateInviteCode } from '~/server/actions/team-actions'

export function useGenerateInviteCode() {
  return useMutation({
    mutationFn: (teamId: string) => generateInviteCode(teamId),
    onSuccess: (data) => {
      toast.success(`New invite code generated: ${data.inviteCode}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate invite code')
    },
  })
}
