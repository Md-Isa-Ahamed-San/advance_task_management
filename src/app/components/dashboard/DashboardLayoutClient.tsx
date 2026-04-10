'use client'

import { useState } from 'react'
import { Sidebar } from '../Sidebar'
import { Menu } from 'lucide-react'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
  userImage?: string
  isAdmin?: boolean
}

export function DashboardLayoutClient({ children, userName, userEmail, userImage, isAdmin }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      
      {/* Mobile Top Header */}
      <div 
        className="md:hidden absolute top-0 left-0 right-0 h-14 border-b flex items-center px-4 z-40"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg transition-colors"
          style={{ color: 'var(--foreground)' }}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'var(--primary-foreground)',
            }}
          >
            TF
          </div>
          <span className="font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            TaskFlow
          </span>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          isAdmin={isAdmin}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </div>

      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        {children}
      </main>
    </div>
  )
}
