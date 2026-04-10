'use client'

import { useState } from 'react'
import { TaskList } from '../tasks/TaskList'
import type { Task } from '../../../../generated/prisma'
import { TaskStats } from '../tasks/TaskStats'
import { TaskFilters } from '../tasks/TaskFilters'
import { Button } from '../ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { TaskForm } from '../tasks/TaskForm'
import { getTeamTasksAction, getTeamTaskSummaryAction } from '~/server/actions/task-actions'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

interface TeamTasksTabProps {
  teamId: string
}

export function TeamTasksTab({ teamId }: TeamTasksTabProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const searchParams = useSearchParams()
  
  const filter = (searchParams.get('filter') ?? 'all') as 'all' | 'active' | 'completed'
  const search = searchParams.get('search') ?? undefined

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'team', teamId, filter, search],
    queryFn: () => getTeamTasksAction(teamId, filter, search),
  })

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['tasks', 'team', teamId, 'summary'],
    queryFn: () => getTeamTaskSummaryAction(teamId),
  })

  const tasks = (tasksData?.tasks ?? []) as Task[]
  const summary = summaryData?.summary ?? { total: 0, completed: 0, active: 0, overdue: 0 }

  if (tasksLoading || summaryLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Team Tasks
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to this team
          </p>
        </div>
        <Button
          onClick={() => setIsAddTaskOpen(true)}
          className="gap-2 rounded-xl shadow-md"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'var(--primary-foreground)',
          }}
        >
          <Plus className="h-4 w-4" />
          New Team Task
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 min-h-0 pr-1">
        {/* Stats */}
        <TaskStats {...summary} />

        {/* Filters */}
        <TaskFilters />

        {/* Task list */}
        <TaskList tasks={tasks} /> 
      </div>

      {isAddTaskOpen && (
        <TaskForm
          teamId={teamId}
          onClose={() => setIsAddTaskOpen(false)}
        />
      )}
    </div>
  )
}
