import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from './client';
import { user } from './schema/auth';

const ADMIN_PHONE = '+923000000000';

async function seed() {
  const userId = randomUUID();

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

  const [adminUser] = await db
    .select()
    .from(user)
    .where(eq(user.phoneNumber, ADMIN_PHONE))
    .limit(1);

  if (!adminUser) {
    throw new Error('Failed to create or find admin user');
  }

  console.log('Seed completed. Admin user (Better Auth, OTP-only):', {
    userId: adminUser.id,
    phoneNumber: ADMIN_PHONE,
    role: 'admin',
    login: 'Sign in with phone number → OTP at /auth/otp',
  });
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
