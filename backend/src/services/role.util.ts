import { prisma } from '../config/prisma.js';
import type { RoleName } from '@prisma/client';

export async function getOrCreateRole(name: RoleName) {
  return prisma.role.upsert({ where: { name }, create: { name }, update: {} });
}
