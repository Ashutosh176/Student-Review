import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

// Admissions §: courses, fees and cutoffs shown on a college's public
// "Admissions" tab (see institution.service.ts getInstitutionBySlug, which
// includes courses + admissionCutoffs directly on the response — this
// service is the admin-only write side plus an admin listing that isn't
// filtered to APPROVED institutions).

export async function listCoursesAdmin(institutionId: string) {
  return prisma.course.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });
}

export async function createCourse(
  institutionId: string,
  input: { name: string; level: string; department?: string; durationYears?: number; feePerYearInr?: number; totalFeeInr?: number },
) {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) throw AppError.notFound('Institution not found');
  return prisma.course.create({ data: { institutionId, ...input } });
}

export async function updateCourse(
  courseId: string,
  input: { name?: string; level?: string; department?: string; durationYears?: number; feePerYearInr?: number; totalFeeInr?: number },
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw AppError.notFound('Course not found');
  return prisma.course.update({ where: { id: courseId }, data: input });
}

export async function deleteCourse(courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw AppError.notFound('Course not found');
  await prisma.course.delete({ where: { id: courseId } });
}

export async function setEntranceExams(institutionId: string, examNames: string[]) {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) throw AppError.notFound('Institution not found');
  // De-dupe, trim — admins paste/type freely, the public tab renders these
  // as a tag list and duplicates would look like a bug there.
  const unique = Array.from(new Set(examNames.map((e) => e.trim()).filter(Boolean)));
  return prisma.institution.update({ where: { id: institutionId }, data: { entranceExams: unique } });
}

export async function listAdmissionCutoffsAdmin(institutionId: string) {
  return prisma.admissionCutoff.findMany({
    where: { institutionId },
    include: { course: { select: { name: true } } },
    orderBy: [{ year: 'desc' }, { examName: 'asc' }],
  });
}

export async function createAdmissionCutoff(
  institutionId: string,
  input: { courseId: string; examName: string; category: string; year: number; openingRank?: number; closingRank?: number; percentile?: number },
) {
  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course || course.institutionId !== institutionId) throw AppError.badRequest('Course does not belong to this institution');
  return prisma.admissionCutoff.create({ data: { institutionId, ...input } });
}

export async function deleteAdmissionCutoff(id: string) {
  const cutoff = await prisma.admissionCutoff.findUnique({ where: { id } });
  if (!cutoff) throw AppError.notFound('Admission cutoff not found');
  await prisma.admissionCutoff.delete({ where: { id } });
}
