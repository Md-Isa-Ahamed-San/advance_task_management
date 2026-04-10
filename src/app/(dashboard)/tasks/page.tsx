import { Suspense } from 'react'
import { getSession } from '~/server/better-auth/server'
import { getTasks, getTaskSummary } from '~/server/queries/tasks'
import { TaskStats } from '@/app/components/tasks/TaskStats'
import { TaskFilters } from '@/app/components/tasks/TaskFilters'
import { TaskList } from '@/app/components/tasks/TaskList'
import { AddTaskButton } from '@/app/components/tasks/TaskForm'

export const metadata = {
  title: 'Tasks — TaskFlow',
}

// Map legacy ?space= values to exact DB category names
const SPACE_TO_CATEGORY: Record<string, string> = {
  personal: 'Personal',
  work:     'Work',
  projects: 'Projects',
}

interface TasksPageProps {
  searchParams: Promise<{
    filter?:   string
    category?: string
    space?:    string
    search?:   string
  }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const session = await getSession()
  const params  = await searchParams
  const userId  = session!.user.id

  const filter = (params.filter ?? 'all') as 'all' | 'active' | 'completed'

  // Resolve category: prefer explicit ?category=, then fall back to ?space= mapping
  const category =
    params.category ??
    (params.space ? (SPACE_TO_CATEGORY[params.space.toLowerCase()] ?? undefined) : undefined)

  const [tasks, summary] = await Promise.all([
    getTasks({ userId, filter, category, search: params.search }),
    getTaskSummary(userId),
  ])

  const activeFilters = [
    category && `Category: ${category}`,
    filter !== 'all' && `Status: ${filter}`,
    params.search && `Search: "${params.search}"`,
  ].filter(Boolean)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Tasks
          </h1>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </p>
            {activeFilters.map((f) => (
              <span
                key={f as string}
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  color: 'var(--primary)',
                }}
              >
                {f as string}
              </span>
            ))}
          </div>
        </div>
        <AddTaskButton />
      </div>

      {/* Stats */}
      <TaskStats {...summary} />

      {/* Filters */}
      <Suspense
        fallback={
          <div
            className="h-10 rounded-xl animate-pulse"
            style={{ backgroundColor: 'var(--muted)' }}
          />
        }
      >
        <TaskFilters />
      </Suspense>

      {/* Task list */}
      <TaskList tasks={tasks} />
    </div>
  )
}
