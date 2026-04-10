import { redirect } from 'next/navigation'

// Dashboard merged into /home — redirect for backward compatibility
export default function DashboardPage() {
  redirect('/home')
}
