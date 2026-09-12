import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function createJob(orgProfileId: string, institutionId: string, input: Record<string, unknown>) {
  return prisma.job.create({
    data: { organizationProfileId: orgProfileId, institutionId, ...input, status: 'DRAFT' } as never,
  });
}

export async function publishJob(orgProfileId: string, jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.organizationProfileId !== orgProfileId) throw AppError.notFound('Job not found');
  return prisma.job.update({ where: { id: jobId }, data: { status: 'PUBLISHED' } });
}

export async function listOrgJobs(orgProfileId: string) {
  return prisma.job.findMany({ where: { organizationProfileId: orgProfileId }, orderBy: { createdAt: 'desc' } });
}

export async function listInstitutionJobs(institutionId: string) {
  return prisma.job.findMany({
    where: { institutionId, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });
}
