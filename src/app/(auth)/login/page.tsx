import { redirect } from 'next/navigation'
import { getSession } from '~/server/better-auth/server'
import { LoginForm } from '@/app/components/auth/LoginForm'

export const metadata = {
  title: 'Sign In — TaskFlow',
  description: 'Sign in to your TaskFlow account',
}

export default async function LoginPage() {
  const session = await getSession()

  if (session) redirect('/home')

  return <LoginForm />
}
