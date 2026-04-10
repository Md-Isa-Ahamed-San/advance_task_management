/**
 * Comprehensive seed file — populates realistic data for all 4 users.
 * Run: npx tsx scripts/seed.ts
 */
import { PrismaClient } from '../generated/prisma'

const db = new PrismaClient()

// ── Real user IDs from the database ──────────────────────────────────────────
const USERS = {
  admin:   'QXOjgAaZZghLThZQ2HlgaxjJ08HaM7qi', // Md Isa Ahamed San  (admin)
  user1:   'GnSX6fkMFaaaFsx1H88XXPPkeyjwwev4', // Isa Ahmed          (user)
  user2:   'ffY1AVxTqnk1G0WSFaoS9EdKfB2rnMCU', // Isa Ahmed          (user)
  user3:   'pK0hIqi3gMXqUhZgGpTQ7RuchZzt3w07', // MD.ISA AHAMED SAN  (user)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysFromNow(d: number): Date {
  const dt = new Date()
  dt.setDate(dt.getDate() + d)
  dt.setHours(9, 0, 0, 0)
  return dt
}

function randomId() {
  return Math.random().toString(36).slice(2, 12)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database...')

  // ── Clean existing seeded data (tasks, teams, logs) ──
  await db.activityLog.deleteMany({})
  await db.teamMessage.deleteMany({})
  await db.teamMember.deleteMany({})
  await db.task.deleteMany({})
  await db.team.deleteMany({})
  console.log('🗑️  Cleared existing tasks, teams, and logs')

  // ════════════════════════════════════════════════════════════
  // TASKS — Admin user (Md Isa Ahamed San)
  // ════════════════════════════════════════════════════════════
  const adminTasks = await db.task.createMany({
    data: [
      // Work tasks
      { title: 'Review Q2 product roadmap',          description: 'Go through the product board and prioritize features for Q2. Align with engineering estimates.', category: 'Work',     priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-14), userId: USERS.admin, createdAt: daysFromNow(-20) },
      { title: 'Update API documentation',           description: 'Add missing endpoints and update deprecated request formats in the developer docs.',              category: 'Work',     priority: 'MEDIUM', completed: true,  dueDate: daysFromNow(-10), userId: USERS.admin, createdAt: daysFromNow(-15) },
      { title: 'Set up CI/CD pipeline for staging',  description: 'Configure GitHub Actions to auto-deploy to staging on PR merge. Include E2E test step.',         category: 'Work',     priority: 'HIGH',   completed: false, dueDate: daysFromNow(2),   userId: USERS.admin, createdAt: daysFromNow(-5) },
      { title: 'Code review: authentication module', description: 'Review PR #142 — JWT refresh token logic and session expiry handling.',                          category: 'Work',     priority: 'HIGH',   completed: false, dueDate: daysFromNow(1),   userId: USERS.admin, createdAt: daysFromNow(-2) },
      { title: 'Fix mobile nav overlay bug',         description: 'Navigation drawer overlaps content on iPhone SE. Reproduce and patch.',                          category: 'Work',     priority: 'MEDIUM', completed: false, dueDate: daysFromNow(-1),  userId: USERS.admin, createdAt: daysFromNow(-4) },
      { title: 'Database performance audit',         description: 'Run EXPLAIN ANALYZE on the 5 slowest queries. Add indexes where needed.',                         category: 'Work',     priority: 'HIGH',   completed: false, dueDate: daysFromNow(5),   userId: USERS.admin, createdAt: daysFromNow(-1) },
      { title: 'Write sprint retrospective notes',   description: 'Document what went well, blockers, and action items from Sprint 18.',                            category: 'Work',     priority: 'LOW',    completed: true,  dueDate: daysFromNow(-7),  userId: USERS.admin, createdAt: daysFromNow(-10) },
      { title: 'Prepare onboarding docs for new hire', description: 'Create a starter guide covering repo structure, local setup, and team norms.',                 category: 'Work',     priority: 'MEDIUM', completed: false, dueDate: daysFromNow(7),   userId: USERS.admin, createdAt: daysFromNow(-1) },

      // Projects
      { title: 'Build admin analytics dashboard',   description: 'Implement charts and KPI cards for the admin panel. Use Recharts.',                               category: 'Projects', priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-3),  userId: USERS.admin, createdAt: daysFromNow(-12) },
      { title: 'Migrate auth to Better Auth',       description: 'Replace custom JWT with Better Auth. Handle existing session migration.',                          category: 'Projects', priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-8),  userId: USERS.admin, createdAt: daysFromNow(-20) },
      { title: 'Implement dark mode support',       description: 'Add CSS variable-based theming with system preference detection.',                                 category: 'Projects', priority: 'MEDIUM', completed: true,  dueDate: daysFromNow(-5),  userId: USERS.admin, createdAt: daysFromNow(-14) },
      { title: 'Add Recharts to task dashboard',    description: 'Wire up priority distribution pie and weekly trend bar chart.',                                    category: 'Projects', priority: 'MEDIUM', completed: false, dueDate: daysFromNow(4),   userId: USERS.admin, createdAt: daysFromNow(-2) },
      { title: 'Calendar view — right sidebar',     description: 'Build upcoming tasks + month list panels for the calendar route.',                                 category: 'Projects', priority: 'MEDIUM', completed: false, dueDate: daysFromNow(3),   userId: USERS.admin, createdAt: daysFromNow(-1) },

      // Personal
      { title: 'Read: Clean Architecture (ch 8–12)', description: 'Focus on the dependency rule and use-case layer patterns.',                                      category: 'Personal', priority: 'LOW',    completed: true,  dueDate: daysFromNow(-6),  userId: USERS.admin, createdAt: daysFromNow(-15) },
      { title: 'Apply to Google Summer of Code',    description: 'Draft proposal for the open-source project. Deadline is strict.',                                  category: 'Personal', priority: 'HIGH',   completed: false, dueDate: daysFromNow(6),   userId: USERS.admin, createdAt: daysFromNow(-3) },
      { title: 'Schedule dentist appointment',      description: 'Overdue — last visit was 8 months ago.',                                                           category: 'Personal', priority: 'LOW',    completed: false, dueDate: daysFromNow(-3),  userId: USERS.admin, createdAt: daysFromNow(-7) },
      { title: 'Gym — update workout plan',         description: 'Switch to 5-day PPL split. Log new PR targets.',                                                   category: 'Personal', priority: 'LOW',    completed: true,  dueDate: daysFromNow(-9),  userId: USERS.admin, createdAt: daysFromNow(-14) },
      { title: 'Submit university assignment #3',   description: 'Algorithm analysis for dynamic programming module. 2000-word report.',                             category: 'Personal', priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-2),  userId: USERS.admin, createdAt: daysFromNow(-10) },
    ],
  })

  // ════════════════════════════════════════════════════════════
  // TASKS — User 1 (Isa Ahmed — glordisagtav)
  // ════════════════════════════════════════════════════════════
  const user1Tasks = await db.task.createMany({
    data: [
      { title: 'Design system color tokens',        description: 'Define the full set of semantic colors for light and dark themes using oklch.',                    category: 'Work',     priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-11), userId: USERS.user1, createdAt: daysFromNow(-18) },
      { title: 'Create Figma component library',   description: 'Build reusable components: Button, Input, Card, Modal, Badge.',                                    category: 'Work',     priority: 'HIGH',   completed: false, dueDate: daysFromNow(3),   userId: USERS.user1, createdAt: daysFromNow(-5) },
      { title: 'User research interviews (5 users)', description: 'Conduct 30-min usability sessions for the new onboarding flow.',                                 category: 'Work',     priority: 'MEDIUM', completed: true,  dueDate: daysFromNow(-4),  userId: USERS.user1, createdAt: daysFromNow(-12) },
      { title: 'Redesign settings page',           description: 'Revamp the account settings page based on the new design system.',                                  category: 'Work',     priority: 'MEDIUM', completed: false, dueDate: daysFromNow(5),   userId: USERS.user1, createdAt: daysFromNow(-2) },
      { title: 'Export design handoff to Zeplin',  description: 'Upload all finalized screens and annotate spacing, fonts, and states.',                             category: 'Work',     priority: 'LOW',    completed: false, dueDate: daysFromNow(8),   userId: USERS.user1, createdAt: daysFromNow(-1) },
      { title: 'Fix accessibility contrast issues', description: 'Audit all button/text combos against WCAG AA 4.5:1 ratio.',                                       category: 'Work',     priority: 'HIGH',   completed: false, dueDate: daysFromNow(-2),  userId: USERS.user1, createdAt: daysFromNow(-6) },
      { title: 'Weekly design review meeting',     description: 'Present latest mockups to product and engineering leads.',                                           category: 'Work',     priority: 'MEDIUM', completed: true,  dueDate: daysFromNow(-7),  userId: USERS.user1, createdAt: daysFromNow(-8) },

      { title: 'Complete React advanced course',   description: 'Finish modules 6–10 on custom hooks, context, and performance.',                                    category: 'Projects', priority: 'MEDIUM', completed: false, dueDate: daysFromNow(10),  userId: USERS.user1, createdAt: daysFromNow(-3) },
      { title: 'Portfolio site redesign',          description: 'New portfolio using Next.js + Framer Motion. Target: modern, dark, animated.',                      category: 'Projects', priority: 'HIGH',   completed: false, dueDate: daysFromNow(14),  userId: USERS.user1, createdAt: daysFromNow(-4) },
      { title: 'Open source contribution: shadcn', description: 'Pick issue #823 and submit a fix for the Dialog scroll bug.',                                       category: 'Projects', priority: 'LOW',    completed: false, dueDate: daysFromNow(12),  userId: USERS.user1, createdAt: daysFromNow(-2) },

      { title: 'Buy birthday gift for mom',        description: 'Look for a nice watch or handbag. Budget: ৳3000.',                                                  category: 'Personal', priority: 'HIGH',   completed: false, dueDate: daysFromNow(2),   userId: USERS.user1, createdAt: daysFromNow(-1) },
      { title: 'Renew library membership',         description: 'Go to JUST library and renew for 6 months.',                                                        category: 'Personal', priority: 'LOW',    completed: true,  dueDate: daysFromNow(-5),  userId: USERS.user1, createdAt: daysFromNow(-9) },
      { title: 'Call family this weekend',         description: '',                                                                                                   category: 'Personal', priority: 'MEDIUM', completed: false, dueDate: daysFromNow(4),   userId: USERS.user1, createdAt: daysFromNow(-1) },
    ],
  })

  // ════════════════════════════════════════════════════════════
  // TASKS — User 2 (Isa Ahmed — shanisa)
  // ════════════════════════════════════════════════════════════
  const user2Tasks = await db.task.createMany({
    data: [
      { title: 'Complete thesis literature review',  description: 'Survey 25+ papers on federated learning for IoT. Summarize in 1500 words.',                     category: 'Work',     priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-5),  userId: USERS.user2, createdAt: daysFromNow(-18) },
      { title: 'Submit conference paper draft',      description: 'Paper on edge computing optimization — due to IEEE submission portal.',                           category: 'Work',     priority: 'HIGH',   completed: false, dueDate: daysFromNow(3),   userId: USERS.user2, createdAt: daysFromNow(-7) },
      { title: 'Lab report: Computer Networks',      description: 'Write up TCP congestion control experiment results with Wireshark captures.',                     category: 'Work',     priority: 'MEDIUM', completed: true,  dueDate: daysFromNow(-8),  userId: USERS.user2, createdAt: daysFromNow(-12) },
      { title: 'Mid-term exam preparation',         description: 'Cover OS scheduling, memory management, and I/O subsystems for CSE 3105.',                        category: 'Work',     priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-3),  userId: USERS.user2, createdAt: daysFromNow(-10) },
      { title: 'Implement sorting algorithm visualizer', description: 'Build bubble, merge, and quick sort visualizer in React with animation speeds.', category: 'Projects', priority: 'MEDIUM', completed: false, dueDate: daysFromNow(7),   userId: USERS.user2, createdAt: daysFromNow(-3) },
      { title: 'Build weather app with OpenWeather API', description: 'Fetch 5-day forecast, display charts, handle errors and loading states.', category: 'Projects', priority: 'LOW', completed: false, dueDate: daysFromNow(9), userId: USERS.user2, createdAt: daysFromNow(-2) },
      { title: 'Set up home NAS with Raspberry Pi', description: 'Install OpenMediaVault, configure RAID 1, set up remote access.',                                 category: 'Projects', priority: 'LOW',    completed: false, dueDate: daysFromNow(20),  userId: USERS.user2, createdAt: daysFromNow(-1) },
      { title: 'Fix hallmate electricity dispute',  description: 'Calculate fair share of electricity bill for the hall room. Talk to management.',                 category: 'Personal', priority: 'MEDIUM', completed: true,  dueDate: daysFromNow(-2),  userId: USERS.user2, createdAt: daysFromNow(-5) },
      { title: 'Prepare CV for internship applications', description: 'Update skills, projects, and GitHub links. Tailor for software dev roles.', category: 'Personal', priority: 'HIGH', completed: false, dueDate: daysFromNow(4), userId: USERS.user2, createdAt: daysFromNow(-2) },
      { title: 'Buy new keyboard',                 description: 'Mechanical, TKL layout, brown switches. Budget: ৳4500.',                                           category: 'Personal', priority: 'LOW',    completed: false, dueDate: daysFromNow(15),  userId: USERS.user2, createdAt: daysFromNow(-1) },
      { title: 'Return borrowed books to library', description: 'Return "Introduction to Algorithms" and "Computer Networks" by Tanenbaum.', category: 'Personal', priority: 'MEDIUM', completed: false, dueDate: daysFromNow(-1), userId: USERS.user2, createdAt: daysFromNow(-6) },
    ],
  })

  // ════════════════════════════════════════════════════════════
  // TASKS — User 3 (MD.ISA AHAMED SAN 190138)
  // ════════════════════════════════════════════════════════════
  const user3Tasks = await db.task.createMany({
    data: [
      { title: 'Complete OS assignment: process scheduling', description: 'Simulate FCFS, SJF, and Round Robin. Include Gantt charts.', category: 'Work', priority: 'HIGH', completed: true, dueDate: daysFromNow(-6), userId: USERS.user3, createdAt: daysFromNow(-14) },
      { title: 'Study for DBMS final exam',          description: 'Focus on normalization (1NF–BCNF), ER diagrams, and SQL joins.',                                 category: 'Work',     priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-1),  userId: USERS.user3, createdAt: daysFromNow(-8) },
      { title: 'Project presentation: E-commerce site', description: 'Demo the full-stack project to faculty. Prepare 10-slide deck.', category: 'Work', priority: 'HIGH', completed: false, dueDate: daysFromNow(2), userId: USERS.user3, createdAt: daysFromNow(-4) },
      { title: 'Submit programming contest solutions', description: 'Upload solutions for Codeforces round 920. Covers DP and graphs.', category: 'Work', priority: 'MEDIUM', completed: true, dueDate: daysFromNow(-4), userId: USERS.user3, createdAt: daysFromNow(-8) },
      { title: 'Fix login bug in e-commerce project', description: 'JWT expiry not handled — user gets stuck on blank screen after token expires.', category: 'Projects', priority: 'HIGH', completed: false, dueDate: daysFromNow(1), userId: USERS.user3, createdAt: daysFromNow(-2) },
      { title: 'Add cart functionality',             description: 'Persist cart state in localStorage. Sync with backend on login.',                                  category: 'Projects', priority: 'MEDIUM', completed: true,  dueDate: daysFromNow(-3),  userId: USERS.user3, createdAt: daysFromNow(-10) },
      { title: 'Create university club event poster', description: 'Design poster for the programming club hackathon using Canva.', category: 'Projects', priority: 'LOW', completed: false, dueDate: daysFromNow(5), userId: USERS.user3, createdAt: daysFromNow(-1) },
      { title: 'Register for upcoming hackathon',    description: 'ICPC Asia Dhaka Regional — form a 3-person team and register before deadline.',                  category: 'Personal', priority: 'HIGH',   completed: false, dueDate: daysFromNow(3),   userId: USERS.user3, createdAt: daysFromNow(-2) },
      { title: 'Pay semester fee',                   description: 'Pay via university portal. Keep receipt.',                                                        category: 'Personal', priority: 'HIGH',   completed: true,  dueDate: daysFromNow(-5),  userId: USERS.user3, createdAt: daysFromNow(-12) },
      { title: 'Organize study group for finals',    description: 'Set up WhatsApp group and schedule 3 sessions this week.',                                        category: 'Personal', priority: 'MEDIUM', completed: false, dueDate: daysFromNow(2),   userId: USERS.user3, createdAt: daysFromNow(-1) },
      { title: 'Learn Docker basics',                description: 'Complete "Docker for Beginners" playlist. Practice with containerizing the e-commerce project.',  category: 'Personal', priority: 'LOW',    completed: false, dueDate: daysFromNow(12),  userId: USERS.user3, createdAt: daysFromNow(-2) },
      { title: 'Buy stationery for new semester',    description: 'Notebook, pens, highlighters. Go to New Market.',                                                 category: 'Personal', priority: 'LOW',    completed: true,  dueDate: daysFromNow(-9),  userId: USERS.user3, createdAt: daysFromNow(-11) },
    ],
  })

  const totalTasks = adminTasks.count + user1Tasks.count + user2Tasks.count + user3Tasks.count
  console.log(`✅  Created ${totalTasks} tasks`)

  // ════════════════════════════════════════════════════════════
  // TEAMS
  // ════════════════════════════════════════════════════════════
  const team1 = await db.team.create({
    data: {
      name: 'TaskFlow Core Team',
      createdById: USERS.admin,
      members: {
        create: [
          { userId: USERS.admin, role: 'OWNER' },
          { userId: USERS.user1, role: 'ADMIN' },
          { userId: USERS.user2, role: 'MEMBER' },
          { userId: USERS.user3, role: 'MEMBER' },
        ],
      },
    },
  })

  const team2 = await db.team.create({
    data: {
      name: 'JUST CSE 190138 Batch',
      createdById: USERS.user3,
      members: {
        create: [
          { userId: USERS.user3, role: 'OWNER' },
          { userId: USERS.user2, role: 'MEMBER' },
          { userId: USERS.admin, role: 'MEMBER' },
        ],
      },
    },
  })

  const team3 = await db.team.create({
    data: {
      name: 'Design & Dev Squad',
      createdById: USERS.user1,
      members: {
        create: [
          { userId: USERS.user1, role: 'OWNER' },
          { userId: USERS.admin, role: 'ADMIN' },
        ],
      },
    },
  })

  console.log(`✅  Created 3 teams`)

  // ════════════════════════════════════════════════════════════
  // TEAM MESSAGES
  // ════════════════════════════════════════════════════════════
  await db.teamMessage.createMany({
    data: [
      { content: 'Hey team! Dashboard MVP is live on staging 🎉', teamId: team1.id, senderId: USERS.admin, createdAt: daysFromNow(-5) },
      { content: 'I found a bug with the category filter — will open a PR today', teamId: team1.id, senderId: USERS.user1, createdAt: daysFromNow(-5) },
      { content: 'Admin analytics page looks great! The charts load fast', teamId: team1.id, senderId: USERS.user2, createdAt: daysFromNow(-4) },
      { content: 'Should we add a notification system next sprint?', teamId: team1.id, senderId: USERS.user3, createdAt: daysFromNow(-4) },
      { content: 'Calendar view redesign is merged ✅', teamId: team1.id, senderId: USERS.admin, createdAt: daysFromNow(-3) },
      { content: 'Dark mode is working perfectly now on mobile too', teamId: team1.id, senderId: USERS.user1, createdAt: daysFromNow(-2) },
      { content: 'Can someone review my PR for the task toggle feature?', teamId: team1.id, senderId: USERS.user2, createdAt: daysFromNow(-1) },
      { content: 'Reviewed and approved! Looks clean', teamId: team1.id, senderId: USERS.admin, createdAt: daysFromNow(-1) },

      { content: 'Study group session tomorrow at 7pm in the library?', teamId: team2.id, senderId: USERS.user3, createdAt: daysFromNow(-3) },
      { content: 'Works for me! I will bring the DBMS notes', teamId: team2.id, senderId: USERS.user2, createdAt: daysFromNow(-3) },
      { content: 'Can someone share the OS slides from last lecture?', teamId: team2.id, senderId: USERS.user3, createdAt: daysFromNow(-2) },
      { content: 'Uploaded to the drive folder 📂', teamId: team2.id, senderId: USERS.admin, createdAt: daysFromNow(-2) },
      { content: 'Project presentation is in 2 days — we should do a dry run', teamId: team2.id, senderId: USERS.user3, createdAt: daysFromNow(-1) },

      { content: 'Figma library is ready — exported all tokens', teamId: team3.id, senderId: USERS.user1, createdAt: daysFromNow(-6) },
      { content: 'I will start wiring up the component styles this week', teamId: team3.id, senderId: USERS.admin, createdAt: daysFromNow(-5) },
      { content: 'The new typography scale is 🔥', teamId: team3.id, senderId: USERS.user1, createdAt: daysFromNow(-3) },
    ],
  })

  console.log(`✅  Created team messages`)

  // ════════════════════════════════════════════════════════════
  // ACTIVITY LOGS
  // ════════════════════════════════════════════════════════════
  await db.activityLog.createMany({
    data: [
      // Admin actions
      { action: 'user.login',      entityType: 'User',   entityId: USERS.admin, userId: USERS.admin, createdAt: daysFromNow(-20), metadata: { ip: '103.125.12.44' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.admin, createdAt: daysFromNow(-19), metadata: { title: 'Review Q2 product roadmap' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.admin, createdAt: daysFromNow(-18), metadata: { title: 'Migrate auth to Better Auth' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.admin, createdAt: daysFromNow(-14), metadata: { title: 'Review Q2 product roadmap' } },
      { action: 'admin.role_changed', entityType: 'User', entityId: USERS.user1, userId: USERS.admin, createdAt: daysFromNow(-12), metadata: { role: 'admin' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.admin, createdAt: daysFromNow(-10), metadata: { title: 'Build admin analytics dashboard' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.admin, createdAt: daysFromNow(-8),  metadata: { title: 'Migrate auth to Better Auth' } },
      { action: 'user.login',      entityType: 'User',   entityId: USERS.admin,  userId: USERS.admin, createdAt: daysFromNow(-7),  metadata: { ip: '103.125.12.44' } },
      { action: 'task.updated',    entityType: 'Task',   entityId: randomId(),   userId: USERS.admin, createdAt: daysFromNow(-5),  metadata: { title: 'Set up CI/CD pipeline' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.admin, createdAt: daysFromNow(-3),  metadata: { title: 'Build admin analytics dashboard' } },
      { action: 'admin.role_changed', entityType: 'User', entityId: USERS.user1, userId: USERS.admin, createdAt: daysFromNow(-2),  metadata: { role: 'user' } },
      { action: 'user.login',      entityType: 'User',   entityId: USERS.admin,  userId: USERS.admin, createdAt: daysFromNow(-1),  metadata: { ip: '103.125.12.44' } },

      // User 1 actions
      { action: 'user.login',      entityType: 'User',   entityId: USERS.user1,  userId: USERS.user1, createdAt: daysFromNow(-18), metadata: { ip: '192.168.1.10' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.user1, createdAt: daysFromNow(-18), metadata: { title: 'Design system color tokens' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.user1, createdAt: daysFromNow(-11), metadata: { title: 'Design system color tokens' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.user1, createdAt: daysFromNow(-5),  metadata: { title: 'Create Figma component library' } },
      { action: 'task.updated',    entityType: 'Task',   entityId: randomId(),   userId: USERS.user1, createdAt: daysFromNow(-3),  metadata: { field: 'dueDate' } },
      { action: 'user.login',      entityType: 'User',   entityId: USERS.user1,  userId: USERS.user1, createdAt: daysFromNow(-2),  metadata: { ip: '192.168.1.10' } },

      // User 2 actions
      { action: 'user.login',      entityType: 'User',   entityId: USERS.user2,  userId: USERS.user2, createdAt: daysFromNow(-14), metadata: { ip: '10.0.0.5' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.user2, createdAt: daysFromNow(-14), metadata: { title: 'Complete thesis literature review' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.user2, createdAt: daysFromNow(-10), metadata: { title: 'Lab report: Computer Networks' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.user2, createdAt: daysFromNow(-5),  metadata: { title: 'Complete thesis literature review' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.user2, createdAt: daysFromNow(-3),  metadata: { title: 'Implement sorting algorithm visualizer' } },
      { action: 'user.login',      entityType: 'User',   entityId: USERS.user2,  userId: USERS.user2, createdAt: daysFromNow(-1),  metadata: { ip: '10.0.0.5' } },

      // User 3 actions
      { action: 'user.login',      entityType: 'User',   entityId: USERS.user3,  userId: USERS.user3, createdAt: daysFromNow(-12), metadata: { ip: '172.16.0.3' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.user3, createdAt: daysFromNow(-12), metadata: { title: 'Pay semester fee' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.user3, createdAt: daysFromNow(-9),  metadata: { title: 'Buy stationery for new semester' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.user3, createdAt: daysFromNow(-6),  metadata: { title: 'Complete OS assignment' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.user3, createdAt: daysFromNow(-5),  metadata: { title: 'Pay semester fee' } },
      { action: 'task.completed',  entityType: 'Task',   entityId: randomId(),   userId: USERS.user3, createdAt: daysFromNow(-4),  metadata: { title: 'Submit programming contest solutions' } },
      { action: 'task.created',    entityType: 'Task',   entityId: randomId(),   userId: USERS.user3, createdAt: daysFromNow(-2),  metadata: { title: 'Fix login bug in e-commerce project' } },
      { action: 'user.login',      entityType: 'User',   entityId: USERS.user3,  userId: USERS.user3, createdAt: daysFromNow(-1),  metadata: { ip: '172.16.0.3' } },
    ],
  })

  console.log(`✅  Created activity logs`)

  console.log('\n🎉 Seed complete! Summary:')
  console.log(`   Users: 4 (1 admin, 3 regular)`)
  console.log(`   Tasks: ${totalTasks} across 3 categories`)
  console.log(`   Teams: 3`)
  console.log(`   Team messages: 17`)
  console.log(`   Activity logs: 34`)
  console.log('\n📌 Run npm run dev and visit /admin to see your data.')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => db.$disconnect())
