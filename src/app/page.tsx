import { redirect } from 'next/navigation'

// Middleware handles auth — authenticated → /home, unauthenticated → /login
export default function RootPage() {
  redirect('/home')
}
