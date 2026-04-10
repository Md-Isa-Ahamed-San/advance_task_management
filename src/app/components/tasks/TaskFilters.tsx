'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '../ui/input'

const FILTERS = ['all', 'active', 'completed'] as const
const CATEGORIES = ['Work', 'Personal', 'Projects'] as const

export function TaskFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentFilter   = (searchParams.get('filter')   ?? 'all') as typeof FILTERS[number]
  const currentCategory = searchParams.get('category') ?? ''
  const currentSearch   = searchParams.get('search')   ?? ''

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filter icon */}
      <SlidersHorizontal className="h-4 w-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />

      {/* Filter pills */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => pushParams({ filter: f === 'all' ? null : f })}
            disabled={isPending}
            className="rounded-lg px-3 py-1 text-sm font-medium capitalize transition-all duration-150"
            style={{
              backgroundColor: currentFilter === f ? 'var(--card)'    : 'transparent',
              color:           currentFilter === f ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow:       currentFilter === f ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category select */}
      <select
        value={currentCategory}
        onChange={(e) => pushParams({ category: e.target.value || null })}
        disabled={isPending}
        className="rounded-xl border px-3 py-1.5 text-sm transition-all"
        style={{
          borderColor:     'var(--border)',
          backgroundColor: 'var(--card)',
          color:           'var(--foreground)',
        }}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search
          className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: 'var(--muted-foreground)' }}
        />
        <Input
          defaultValue={currentSearch}
          placeholder="Search tasks…"
          className="pl-8 pr-8 rounded-xl"
          onChange={(e) => {
            const value = e.target.value
            clearTimeout((e.target as HTMLInputElement & { _t?: ReturnType<typeof setTimeout> })._t)
            ;(e.target as HTMLInputElement & { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(
              () => pushParams({ search: value || null }),
              400,
            )
          }}
        />
        {currentSearch && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-opacity hover:opacity-70"
            onClick={() => pushParams({ search: null })}
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isPending && (
        <span className="text-xs animate-pulse" style={{ color: 'var(--muted-foreground)' }}>
          Updating…
        </span>
      )}
    </div>
  )
}
