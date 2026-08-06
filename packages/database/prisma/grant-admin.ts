/**
 * One-time, manual bootstrap: flips isPlatformAdmin for a single account so it can
 * reach /admin/access-codes. There's no self-serve way to become a platform admin
 * (and there shouldn't be) -- this is the only path, run by hand once per admin.
 *
 * Usage: pnpm --filter @ruach/database exec tsx prisma/grant-admin.ts you@example.com
 */
import { rawDb } from "../src/index";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: tsx prisma/grant-admin.ts <email>");
    process.exit(1);
  }

  const user = await rawDb.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}. Sign up (or seed) that account first.`);
    process.exit(1);
  }

  await rawDb.user.update({ where: { id: user.id }, data: { isPlatformAdmin: true } });
  console.log(`Granted platform admin to ${email}. They can now reach /admin/access-codes.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => rawDb.$disconnect());
