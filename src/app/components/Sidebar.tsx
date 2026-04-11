'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home, Bell, CheckSquare, Calendar, Users, Shield, LogOut, Sun, Moon, MessageSquare } from 'lucide-react'
import { authClient } from '~/server/better-auth/client'
import { useEffect, useState } from 'react'

interface SidebarProps {
  userName?: string
  userEmail?: string
  userImage?: string
  isAdmin?: boolean
  onCloseMobile?: () => void
  chatInviteCount?: number
}

const navigationItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/notifications', label: 'Notification', icon: Bell },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/teams', label: 'Teams', icon: Users },
  { path: '/conversations', label: 'Conversation', icon: MessageSquare },
  { path: '/admin', label: 'Admin Panel', icon: Shield },
]

// Space id → exact DB category value (title-case)
const spaces = [
  { id: 'Personal', label: 'Personal', color: 'var(--chart-1)' },
  { id: 'Work',     label: 'Work',     color: 'var(--chart-2)' },
  { id: 'Projects', label: 'Projects', color: 'var(--chart-3)' },
]

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

export function Sidebar({ 
  userName = 'User', 
  userEmail = '', 
  userImage, 
  isAdmin = false, 
  onCloseMobile,
  chatInviteCount = 0
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') ?? ''

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = saved === 'dark' || (!saved && prefersDark)
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push('/login') },
    })
  }

  return (
    <aside
      className="flex flex-col h-screen w-64 border-r"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar, var(--background))' }}
    >
      {/* ── Header ── */}
      <div className="border-b px-4 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'var(--primary-foreground)',
            }}
          >
            TF
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            TaskFlow
          </span>
        </div>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-1.5 transition-colors hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main nav */}
        <div className="space-y-0.5">
          {navigationItems.map((item) => {
            if (item.path === '/admin' && !isAdmin) return null
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onCloseMobile}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
                style={{
                  color: isActive ? 'var(--primary)' : 'var(--foreground)',
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                    : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                )}
                {!isActive && item.path === '/conversations' && chatInviteCount > 0 && (
                  <span
                    className="ml-auto flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background"
                    style={{ backgroundColor: 'var(--destructive)', background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
                  >
                    {chatInviteCount > 9 ? '9+' : chatInviteCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Spaces */}
        <div>
          <p
            className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Spaces
          </p>
          <div className="space-y-0.5">
            {spaces.map((space) => {
              // Active when on /tasks and category matches this space
              const isSpaceActive = pathname === '/tasks' && currentCategory === space.id
              return (
                <Link
                  key={space.id}
                  href={`/tasks?category=${space.id}`}
                  onClick={onCloseMobile}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150"
                  style={{
                    color: isSpaceActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                    backgroundColor: isSpaceActive
                      ? 'color-mix(in srgb, var(--muted) 60%, transparent)'
                      : 'transparent',
                    fontWeight: isSpaceActive ? 500 : 400,
                  }}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full transition-all"
                    style={{ backgroundColor: space.color }}
                  />
                  <span>{space.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* ── User Profile ── */}
      <div className="border-t px-3 py-3 space-y-1" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2"
          style={{ backgroundColor: 'color-mix(in srgb, var(--muted) 40%, transparent)' }}
        >
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt={userName} className="h-7 w-7 rounded-full object-cover ring-2 ring-border" />
          ) : (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'var(--primary-foreground)',
              }}
            >
              {getInitials(userName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>
              {userName}
            </p>
            <p className="truncate text-[11px] leading-tight" style={{ color: 'var(--muted-foreground)' }}>
              {userEmail}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors w-full hover:opacity-80"
          style={{ color: 'var(--destructive)' }}
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
