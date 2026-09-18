import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { hashPassword } from '../utils/password.js';
import { getOrCreateRole } from './role.util.js';

// The one permanent site-owner admin account, identified by ADMIN_EMAIL.
// Runs once at boot (server.ts). Idempotent and deliberately asymmetric:
//   - account doesn't exist yet -> create it with ADMIN_PASSWORD
//   - account already exists    -> only ensure the ADMIN role, never touch
//     the password, so logging in and changing it via Settings is never
//     silently undone by a later restart.
// Never logs ADMIN_PASSWORD.
export async function ensureAdminAccount(): Promise<void> {
  if (!env.admin.email || !env.admin.password) {
    logger.warn('ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping permanent admin bootstrap');
    return;
  }

  const adminRole = await getOrCreateRole('ADMIN');
  const existing = await prisma.user.findUnique({ where: { email: env.admin.email } });

  if (existing) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: existing.id, roleId: adminRole.id } },
      create: { userId: existing.id, roleId: adminRole.id },
      update: {},
    });
    logger.info({ email: env.admin.email }, 'Admin bootstrap: ADMIN role ensured on existing account');
    return;
  }

  const studentRole = await getOrCreateRole('STUDENT');
  const passwordHash = await hashPassword(env.admin.password);
  await prisma.user.create({
    data: {
      username: env.admin.username,
      email: env.admin.email,
      passwordHash,
      emailVerifiedAt: new Date(),
      roles: { create: [{ roleId: adminRole.id }, { roleId: studentRole.id }] },
    },
  });
  logger.info({ email: env.admin.email }, 'Admin bootstrap: created new admin account');
}
