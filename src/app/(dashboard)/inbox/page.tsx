import { redirect } from 'next/navigation'

// Renamed to /notifications — redirect for backward compatibility
export default function InboxPage() {
  redirect('/notifications')
}
