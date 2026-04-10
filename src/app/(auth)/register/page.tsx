import { redirect } from 'next/navigation'
import { getSession } from '~/server/better-auth/server'
import { SignUpForm } from '@/app/components/auth/SignUpForm'

export const metadata = {
  title: 'Create Account — TaskFlow',
  description: 'Create a new TaskFlow account',
}

export default async function RegisterPage() {
  const session = await getSession()

  if (session) redirect('/home')

  return <SignUpForm />
}
