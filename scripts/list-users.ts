import { PrismaClient } from '../generated/prisma'
const db = new PrismaClient()
async function main() {
  const users = await db.user.findMany({ select: { id: true, name: true, email: true, role: true } })
  console.log(JSON.stringify(users, null, 2))
}
main().catch(console.error).finally(() => db.$disconnect())
