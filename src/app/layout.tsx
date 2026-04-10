import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '~/styles/globals.css'
import { Toaster } from './components/ui/sonner'
import { QueryProvider } from './components/providers/QueryProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TaskFlow — Task Management',
    template: '%s | TaskFlow',
  },
  description:
    'TaskFlow is a modern, collaborative task management app. Organize tasks, manage teams, and track progress — all in one place.',
  keywords: ['task management', 'productivity', 'teams', 'collaboration', 'project management'],
  authors: [{ name: 'TaskFlow' }],
  openGraph: {
    title: 'TaskFlow — Task Management',
    description: 'Organize tasks, manage teams, and track progress.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'TaskFlow — Task Management',
    description: 'Organize tasks, manage teams, and track progress.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
