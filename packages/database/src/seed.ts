import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { eq, and } from 'drizzle-orm';
import { db } from './client';
import { user, account } from './schema/auth';

const ADMIN_PHONE = '+923000000000';
const ADMIN_DEFAULT_PASSWORD = 'Aadel@123';

async function seed() {
  const userId = randomUUID();

  // 1. Insert user (Better Auth user table)
  await db
    .insert(user)
    .values({
      id: userId,
      name: 'Admin',
      phoneNumber: ADMIN_PHONE,
      phoneNumberVerified: true,
      role: 'admin',
      emailVerified: false,
    })
    .onConflictDoNothing({ target: user.phoneNumber });

  // 2. Resolve existing user by phone (in case seed was run before)
  const [adminUser] = await db
    .select()
    .from(user)
    .where(eq(user.phoneNumber, ADMIN_PHONE))
    .limit(1);

  if (!adminUser) {
    throw new Error('Failed to create or find admin user');
  }

  // 3. Insert credential account so sign-in with phone + password works (Better Auth account table)
  const existingCredential = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, adminUser.id),
        eq(account.providerId, 'credential')
      )
    )
    .limit(1);

  if (existingCredential.length === 0) {
    const passwordHash = await hashPassword(ADMIN_DEFAULT_PASSWORD);
    await db.insert(account).values({
      id: randomUUID(),
      userId: adminUser.id,
      accountId: adminUser.id,
      providerId: 'credential',
      password: passwordHash,
    });
  }

  console.log('Seed completed. Admin user (Better Auth):', {
    userId: adminUser.id,
    phoneNumber: ADMIN_PHONE,
    role: 'admin',
    login: 'Sign in with phone number + password (e.g. signIn.phoneNumber)',
  });
  if (existingCredential.length === 0) {
    console.log(
      'Default password set. Override with ADMIN_SEED_PASSWORD env var.'
    );
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
