# TaskFlow — T3 Stack Development Roadmap

**Stack:** Next.js 15 · TypeScript · Prisma · Tailwind · Better Auth · TanStack Query · shadcn/ui · Neon PostgreSQL

---

## Architecture Philosophy

Before phases begin, understand how data flows in this app:

```
Database (Neon)
    ↓
Prisma (ORM)
    ↓
Server Queries → Page (Server Component) → Props → Client Component
Server Actions → Custom Hook (TanStack Mutation) → UI Trigger
```

**Rules:**
- No `useEffect` for data fetching — ever
- No `useContext` for global state — use server props + URL state
- No `localStorage` for auth or tasks
- Server Components fetch, Client Components mutate

---

## Project Structure

```
taskflow/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Server: redirect if session exists
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               # Server: getSession → pass to Sidebar
│   │   │   ├── page.tsx                 # Home view
│   │   │   ├── inbox/page.tsx
│   │   │   ├── tasks/page.tsx           # Accepts ?filter=&category= searchParams
│   │   │   ├── calendar/page.tsx        # Accepts ?month=&year= searchParams
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [teamId]/page.tsx
│   │   │   └── admin/page.tsx
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/route.ts    # Better Auth handler
│   │   │
│   │   ├── layout.tsx                   # Root: QueryProvider + Toaster
│   │   └── globals.css
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # Server Component — receives user from layout
│   │   │   ├── Header.tsx               # Server Component
│   │   │   └── MobileNav.tsx            # Client Component — toggle state only
│   │   │
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx             # Server Component — display only
│   │   │   ├── TaskList.tsx             # Client Component — owns delete/toggle hooks
│   │   │   ├── TaskForm.tsx             # Client Component — owns create/update hooks
│   │   │   ├── TaskFilters.tsx          # Client Component — pushes URL searchParams
│   │   │   └── TaskStats.tsx            # Server Component — receives computed stats
│   │   │
│   │   ├── views/
│   │   │   ├── HomeView.tsx             # Server Component
│   │   │   ├── InboxView.tsx            # Server Component
│   │   │   ├── CalendarView.tsx         # Client Component — calendar grid interaction
│   │   │   ├── DashboardView.tsx        # Server Component — receives chart data
│   │   │   └── TeamsView.tsx            # Client Component — real-time updates
│   │   │
│   │   ├── teams/
│   │   │   ├── TeamCard.tsx             # Server Component
│   │   │   ├── TeamForm.tsx             # Client Component — create/edit team
│   │   │   ├── MemberList.tsx           # Server Component
│   │   │   ├── AddMemberModal.tsx       # Client Component
│   │   │   └── TeamChat.tsx             # Client Component — SSE/polling
│   │   │
│   │   ├── admin/
│   │   │   ├── UserTable.tsx            # Server Component
│   │   │   ├── ActivityLog.tsx          # Server Component
│   │   │   └── AdminStats.tsx           # Server Component
│   │   │
│   │   └── ui/                          # shadcn/ui components only
│   │       └── [button, card, dialog, input, select, badge, skeleton ...]
│   │
│   ├── server/
│   │   │
│   │   ├── actions/
│   │   │   │   # 'use server' — called from hooks or forms
│   │   │   │   # Each action: auth check → db op → revalidatePath → return
│   │   │   │
│   │   │   ├── task-actions.ts
│   │   │   │   # createTask(data)
│   │   │   │   # updateTask(id, data)
│   │   │   │   # deleteTask(id)
│   │   │   │   # toggleComplete(id)
│   │   │   │   # bulkDeleteTasks(ids[])
│   │   │   │
│   │   │   ├── team-actions.ts
│   │   │   │   # createTeam(data)
│   │   │   │   # updateTeam(id, data)
│   │   │   │   # deleteTeam(id)
│   │   │   │   # addMember(teamId, email)
│   │   │   │   # removeMember(teamId, userId)
│   │   │   │   # sendMessage(teamId, content)
│   │   │   │
│   │   │   └── admin-actions.ts
│   │   │       # deleteUser(userId)
│   │   │       # updateUserRole(userId, role)
│   │   │
│   │   └── queries/
│   │       │   # Pure async functions — called only from Server Components
│   │       │   # No 'use server' needed — they run on server by default
│   │       │
│   │       ├── tasks.ts
│   │       │   # getTasks({ userId, filter, category, search })
│   │       │   # getTaskById(id)
│   │       │   # getOverdueTasks(userId)
│   │       │   # getTasksDueToday(userId)
│   │       │   # getTasksByMonth(userId, year, month)
│   │       │
│   │       ├── teams.ts
│   │       │   # getTeams(userId)
│   │       │   # getTeamById(id)
│   │       │   # getTeamMessages(teamId, limit)
│   │       │   # getTeamMembers(teamId)
│   │       │
│   │       ├── stats.ts
│   │       │   # getTaskStats(userId)         → { total, completed, active, overdue }
│   │       │   # getPriorityDistribution(userId)
│   │       │   # getWeeklyCompletionTrend(userId)
│   │       │   # getCategoryBreakdown(userId)
│   │       │
│   │       └── admin.ts
│   │           # getAllUsers()
│   │           # getActivityLogs(limit)
│   │           # getSystemStats()
│   │
│   ├── hooks/
│   │   │   # 'use client' — TanStack useMutation wrappers around server actions
│   │   │   # Pattern: call action → on success: toast + invalidate query cache
│   │   │   # Used inside Client Components only
│   │   │
│   │   ├── use-create-task.ts
│   │   ├── use-update-task.ts
│   │   ├── use-delete-task.ts
│   │   ├── use-toggle-complete.ts
│   │   ├── use-bulk-delete-tasks.ts
│   │   ├── use-create-team.ts
│   │   ├── use-update-team.ts
│   │   ├── use-delete-team.ts
│   │   ├── use-add-member.ts
│   │   ├── use-remove-member.ts
│   │   ├── use-send-message.ts
│   │   └── use-admin-actions.ts
│   │
│   └── lib/
│       ├── auth.ts                      # Better Auth config (providers, callbacks)
│       ├── auth-client.ts               # Client-side auth helpers (signIn, signOut)
│       ├── db.ts                        # Prisma client singleton
│       └── utils.ts                     # cn(), formatDate(), etc.
│
└── middleware.ts                        # Protect (dashboard) — redirect to /login
```

---

## When to Use What

| Need | Use |
|------|-----|
| Fetch data for a page | `server/queries/*.ts` called in Server Component |
| Create / Update / Delete | `server/actions/*.ts` + matching hook |
| React to a mutation in UI | Custom hook (`hooks/use-*.ts`) with `useMutation` |
| Filter/search without refetch | URL `searchParams` + `router.push` |
| Auth check in a page | `getSession()` in Server Component |
| Auth check across all routes | `middleware.ts` |
| Shared UI state (modal open etc.) | Local `useState` in that component only |

---

## Phase 1: Database Setup & Schema Design

**Goal:** Production-ready Prisma schema on Neon PostgreSQL.

**Schema additions to Better Auth base:**

```prisma
model Task {
  id          String    @id @default(cuid())
  title       String
  description String    @default("")
  category    String?                        // "Work" | "Personal" | "Projects"
  priority    Priority  @default(MEDIUM)
  completed   Boolean   @default(false)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  userId  String
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  teamId  String?
  team    Team?  @relation(fields: [teamId], references: [id])

  @@index([userId, completed])
  @@index([userId, dueDate])
  @@index([teamId])
}

enum Priority { HIGH MEDIUM LOW }

model Team {
  id          String        @id @default(cuid())
  name        String
  createdAt   DateTime      @default(now())
  createdById String
  createdBy   User          @relation("TeamOwner", fields: [createdById], references: [id])
  members     TeamMember[]
  messages    TeamMessage[]
  tasks       Task[]
}

model TeamMember {
  id        String     @id @default(cuid())
  role      MemberRole @default(MEMBER)
  joinedAt  DateTime   @default(now())
  teamId    String
  userId    String
  team      Team       @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
}

enum MemberRole { OWNER ADMIN MEMBER }

model TeamMessage {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  teamId    String
  senderId  String
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  sender    User     @relation(fields: [senderId], references: [id])
}

model ActivityLog {
  id         String   @id @default(cuid())
  action     String                          // "task.created" | "user.deleted" etc.
  entityType String                          // "Task" | "Team" | "User"
  entityId   String
  metadata   Json?
  createdAt  DateTime @default(now())
  userId     String
  user       User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([createdAt])
}
```

**Deliverables:** Schema deployed to Neon, `prisma generate` passing, `seed.ts` with sample data.

---

## Phase 2: Authentication (Better Auth)

**Goal:** Real session-based auth replacing all localStorage login logic.

**Files touched:**
- `src/lib/auth.ts` — configure `betterAuth({ providers: [credentials(), google()] })`
- `src/lib/auth-client.ts` — export `authClient` for client-side `signIn`/`signOut`
- `src/app/api/auth/[...all]/route.ts` — mount Better Auth handler
- `src/app/(auth)/login/page.tsx` — call `authClient.signIn.email()` and `authClient.signIn.social("google")`
- `src/app/(auth)/register/page.tsx` — call `authClient.signUp.email()`
- `middleware.ts` — `getSession()` → redirect unauthenticated users from `/dashboard/*` to `/login`
- `src/app/(dashboard)/layout.tsx` — `getSession()` server-side → pass `user` to `<Sidebar />`

**Pattern for protected pages:**
```ts
// Any (dashboard) page or layout
const session = await getSession();
if (!session) redirect('/login');
// session.user.id used for all queries below
```

---

## Phase 3: Task Server Layer

**Goal:** All task queries and actions implemented and tested.

**`server/queries/tasks.ts`** — pure Prisma queries, called from Server Components only:
```ts
getTasks({ userId, filter?, category?, search? })  // Used by /tasks page
getTasksDueToday(userId)                            // Used by HomeView
getOverdueTasks(userId)                             // Used by HomeView + InboxView
getTasksByMonth(userId, year, month)                // Used by CalendarView
```

**`server/actions/task-actions.ts`** — `'use server'`, each action:
1. Calls `getSession()` → throws if unauthenticated
2. Verifies ownership before update/delete
3. Runs Prisma operation
4. Calls `revalidatePath()` for affected routes
5. Logs to `ActivityLog`

---

## Phase 4: Task Client Integration

**Goal:** All task UI wired to real data. Zero localStorage.

**Custom hooks** (`hooks/`) — each follows this exact pattern:
```ts
// hooks/use-create-task.ts
'use client';
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,           // server action imported directly
    onSuccess: () => {
      toast.success('Task created');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast.error('Failed'),
  });
}
```

**Client Components that use hooks:** `TaskForm`, `TaskList`, `TaskFilters`

**Server Components that fetch:** `/tasks/page.tsx`, `/page.tsx`, `/inbox/page.tsx`

**URL-driven filtering** (no state, no context):
```ts
// tasks/page.tsx
export default async function TasksPage({ searchParams }) {
  const session = await getSession();
  const tasks = await getTasks({
    userId: session.user.id,
    filter: searchParams.filter,       // "all" | "active" | "completed"
    category: searchParams.category,   // "Work" | "Personal" | "Projects"
    search: searchParams.search,
  });
  return <TaskList tasks={tasks} />;   // TaskList is Client for mutations only
}
```

---

## Phase 5: Teams Server Layer

**Goal:** Team + membership + messaging server layer complete.

**`server/queries/teams.ts`:**
```ts
getTeams(userId)                    // Teams where user is a member
getTeamById(id)                     // With members included
getTeamMessages(teamId, limit)      // Latest N messages
```

**`server/actions/team-actions.ts`:**
```ts
createTeam(data)                    // Creates team + adds creator as OWNER member
addMember(teamId, email)            // Looks up user by email → creates TeamMember
removeMember(teamId, userId)        // OWNER/ADMIN only
sendMessage(teamId, content)        // Creates TeamMessage
deleteTeam(id)                      // OWNER only → cascades
```

---

## Phase 6: Teams Client Integration

**Goal:** `TeamsView` fully functional with real backend.

**Hooks used:** `useCreateTeam`, `useAddMember`, `useRemoveMember`, `useSendMessage`, `useDeleteTeam`

**`TeamChat.tsx`** — Client Component using polling (every 5s via `useQuery` with `refetchInterval`) until Phase 10 adds SSE:
```ts
useQuery({
  queryKey: ['messages', teamId],
  queryFn: () => fetch(`/api/teams/${teamId}/messages`).then(r => r.json()),
  refetchInterval: 5000,
})
```

---

## Phase 7: Dashboard with Real Aggregates

**Goal:** Replace all mock chart data with Prisma aggregation queries.

**`server/queries/stats.ts`** — all Prisma `groupBy` / `count` / `aggregate` queries:
```ts
getTaskStats(userId)              → { total, completed, active, overdue }
getPriorityDistribution(userId)   → [{ priority, count }]
getWeeklyTrend(userId)            → [{ date, created, completed }] × 7 days
getCategoryBreakdown(userId)      → [{ category, total, completed }]
```

**`dashboard/page.tsx`** — Server Component fetches all 4 stat shapes → passes to `DashboardView` as props → Recharts render client-side.

---

## Phase 8: Calendar & Inbox Views

**`calendar/page.tsx`** — accepts `?month=&year=` searchParams → `getTasksByMonth()` → passes to `CalendarView`. Navigation arrows in `CalendarView` push new URL params via `router.push`.

**`inbox/page.tsx`** — `getOverdueTasks()` + `getTasks({ category: null })` → `InboxView`. Overdue calculation happens in the query using Prisma `where: { dueDate: { lt: new Date() } }` — not client-side.

---

## Phase 9: Admin Panel

**Goal:** Real user management + activity audit log.

**`server/queries/admin.ts`:**
```ts
getAllUsers()         // User list with task counts
getActivityLogs()    // Latest 50 ActivityLog entries with user
getSystemStats()     // { totalUsers, totalTasks, activeToday }
```

**Role guard** — two layers:
1. `middleware.ts` checks `session.user.role === 'ADMIN'` before `/admin`
2. `admin-actions.ts` re-checks role server-side before any destructive operation

**ActivityLog** written inside every action that creates/updates/deletes — gives the admin security log for free.

---

## Phase 10: Real-time (SSE)

**Goal:** Team chat and shared task updates go live without polling.

**Approach:** Server-Sent Events (no external dependency like Pusher needed).

```ts
// app/api/teams/[teamId]/stream/route.ts
export async function GET(req, { params }) {
  const stream = new ReadableStream({ ... });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

**`TeamChat.tsx`** replaces `refetchInterval` with `EventSource` connection. Shared team tasks trigger SSE event → connected clients call `queryClient.invalidateQueries(['tasks'])`.

---

## Phase 11: Testing

**Unit tests** (Jest + React Testing Library):
- `TaskCard` renders priority badge correctly
- `TaskForm` validation — submit blocked when title empty
- Utility functions (`formatDate`, `cn`)

**E2E tests** (Playwright):
- Register → create task → mark complete → verify in dashboard stats
- Login with wrong password → error shown
- Admin deletes user → user removed from table

---

## Phase 12: Performance & Caching

**Next.js caching tags:**
```ts
// In queries
unstable_cache(getTasks, ['tasks'], { tags: ['tasks'] })

// In actions after mutation
revalidateTag('tasks')    // instead of revalidatePath per-route
```

**Loading UI** — every page gets a `loading.tsx` with Skeleton components matching the actual layout. Charts in `DashboardView` use `dynamic(() => import('./Charts'), { ssr: false })` to avoid hydration mismatch.

---

## Phase 13: Final Polish

- All form errors go through `sonner` toast — no inline error divs
- All interactive elements have `aria-label`
- `robots.ts` + `sitemap.ts` if public pages exist
- Connection pool configured in `db.ts` for Neon serverless: `{ connectionLimit: 5 }`
- Environment variables validated at startup with `zod` in `env.ts`

---

## Execution Order Summary

| Phase | What You Build | Key Files |
|-------|---------------|-----------|
| 1 | Schema + Neon | `schema.prisma`, `seed.ts` |
| 2 | Auth | `auth.ts`, `middleware.ts`, login/register pages |
| 3 | Task server layer | `queries/tasks.ts`, `actions/task-actions.ts` |
| 4 | Task UI | `TaskForm`, `TaskList`, all task hooks |
| 5 | Team server layer | `queries/teams.ts`, `actions/team-actions.ts` |
| 6 | Team UI | `TeamsView`, `TeamChat`, team hooks |
| 7 | Dashboard | `queries/stats.ts`, `DashboardView` |
| 8 | Calendar + Inbox | `CalendarView`, `InboxView`, month queries |
| 9 | Admin | `queries/admin.ts`, `AdminPanel`, role guards |
| 10 | Real-time | SSE route, `EventSource` in `TeamChat` |
| 11 | Tests | Jest unit tests, Playwright E2E |
| 12 | Caching + perf | `unstable_cache`, `loading.tsx`, dynamic imports |
| 13 | Polish | Accessibility, env validation, deploy |