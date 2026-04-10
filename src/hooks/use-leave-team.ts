'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leaveTeam } from '~/server/actions/team-actions'

export function useLeaveTeam() {
  return useMutation({
    mutationFn: (teamId: string) => leaveTeam(teamId),
    onSuccess: () => {
      toast.success('You have left the team')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to leave team')
    },
  })
}
