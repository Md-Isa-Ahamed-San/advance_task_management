/**
 * One-time script to promote a user to admin by email.
 * Usage:  npx tsx scripts/make-admin.ts your@email.com
 * Delete this file after use.
 */
import { PrismaClient } from '../generated/prisma'

const db = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx tsx scripts/make-admin.ts <email>')
    process.exit(1)
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`❌  No user found with email: ${email}`)
    process.exit(1)
  }

  await db.user.update({
    where: { email },
    data:  { role: 'admin' },
  })

  console.log(`✅  ${user.name} (${email}) is now an admin.`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
