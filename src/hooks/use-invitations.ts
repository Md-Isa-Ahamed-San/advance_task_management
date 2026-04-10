'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { inviteMember, getPendingInvitations, respondToInvitation } from '~/server/actions/team-actions'

export function useInviteMember(teamId: string) {
  return useMutation({
    mutationFn: (email: string) => inviteMember(teamId, email),
    onSuccess: () => {
      toast.success('Invitation sent successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send invitation')
    },
  })
}

export function usePendingInvitations() {
  return useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: () => getPendingInvitations(),
  })
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invitationId, accept }: { invitationId: string; accept: boolean }) =>
      respondToInvitation(invitationId, accept),
    onSuccess: (_, { accept }) => {
      toast.success(accept ? 'Invitation accepted!' : 'Invitation rejected.')
      void queryClient.invalidateQueries({ queryKey: ['invitations'] })
      void queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process invitation')
    },
  })
}
