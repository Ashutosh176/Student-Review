import fs from 'node:fs';
import { stripIdentity } from '../utils/serializers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import * as adminService from '../services/admin.service.js';
import * as orgService from '../services/organization.service.js';
import * as verificationService from '../services/verification.service.js';
import * as admissionService from '../services/admission.service.js';
import { generateInstitutionSummary } from '../services/aiSummary.service.js';
import { recomputeAllRankings } from '../modules/ranking/ranking.service.js';
import { razorpayMode } from '../config/razorpay.js';
import { sendStoredDocument } from '../middlewares/upload.js';

// documentUrl is an internal storage key, not for client consumption — the
// dedicated download route resolves it server-side instead. universityEmail
// is left as-is here since these routes are already authorize('ADMIN')-gated,
// matching the same exposure level as the admin verification list.
function stripSensitiveVerificationFields<T extends { documentUrl?: unknown }>(row: T) {
  const { documentUrl, ...safe } = row;
  return { ...safe, hasDocument: Boolean(documentUrl) };
}

export const dashboard = asyncHandler(async (_req, res) => {
  ok(res, await adminService.dashboardStats());
});

export const analytics = asyncHandler(async (_req, res) => {
  ok(res, await adminService.platformAnalytics());
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query as never);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const setUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.setUserStatus(req.user!.id, req.params.id, req.body.status, req.body.reason);
  ok(res, { id: user.id, status: user.status });
});

export const moderationQueue = asyncHandler(async (req, res) => {
  const result = await adminService.moderationQueue(Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items.map(stripIdentity), 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const moderateReview = asyncHandler(async (req, res) => {
  const updated = await adminService.moderateReviewAction(req.user!.id, req.params.id, req.body.action, req.body.reason);
  ok(res, stripIdentity(updated));
});

export const listReports = asyncHandler(async (req, res) => {
  const result = await adminService.listReports(req.query.status as string | undefined, Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items.map(stripIdentity), 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const dismissReport = asyncHandler(async (req, res) => {
  const report = await adminService.dismissReport(req.user!.id, req.params.id);
  ok(res, stripIdentity(report));
});

export const listClaims = asyncHandler(async (req, res) => {
  const claims = await orgService.listClaims(req.query.status as never);
  ok(res, claims);
});

export const downloadClaimDocument = asyncHandler(async (req, res) => {
  const record = await orgService.getClaimDocumentPath(req.params.id);
  if (!record) throw AppError.notFound('No document was submitted with this claim');

  await sendStoredDocument(res, record.path);
});

export const decideClaim = asyncHandler(async (req, res) => {
  const claim = await orgService.decideClaim(req.params.id, req.user!.id, req.body.decision, req.body.reason);
  ok(res, claim);
});

export const listVerifications = asyncHandler(async (req, res) => {
  const status = req.query.status as 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'REVOKED' | undefined;
  const requests = await verificationService.listVerificationsAdmin(status);
  ok(res, requests);
});

export const decideVerification = asyncHandler(async (req, res) => {
  const updated = await verificationService.decideDocumentVerification(req.user!.id, req.params.id, req.body.decision, req.body.reason);
  ok(res, stripSensitiveVerificationFields(updated));
});

export const revokeVerification = asyncHandler(async (req, res) => {
  const updated = await verificationService.revokeVerification(req.user!.id, req.params.id, req.body.reason);
  ok(res, stripSensitiveVerificationFields(updated));
});

export const downloadVerificationDocument = asyncHandler(async (req, res) => {
  const storageKey = await verificationService.getVerificationDocumentPath(req.params.id);
  if (!storageKey) throw AppError.notFound('No document was submitted with this verification');

  await sendStoredDocument(res, storageKey);
});

export const listEmailDomains = asyncHandler(async (req, res) => {
  const domains = await verificationService.listEmailDomains(req.params.id);
  ok(res, domains);
});

export const addEmailDomain = asyncHandler(async (req, res) => {
  const domain = await verificationService.addEmailDomain(req.params.id, req.body.domain);
  ok(res, domain, 201);
});

export const removeEmailDomain = asyncHandler(async (req, res) => {
  await verificationService.removeEmailDomain(req.params.domainId);
  ok(res, { removed: true });
});

// ───────────────────────── Admissions ─────────────────────────

export const listCourses = asyncHandler(async (req, res) => {
  ok(res, await admissionService.listCoursesAdmin(req.params.id));
});

export const createCourse = asyncHandler(async (req, res) => {
  ok(res, await admissionService.createCourse(req.params.id, req.body), 201);
});

export const updateCourse = asyncHandler(async (req, res) => {
  ok(res, await admissionService.updateCourse(req.params.id, req.body));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await admissionService.deleteCourse(req.params.id);
  ok(res, { removed: true });
});

export const setEntranceExams = asyncHandler(async (req, res) => {
  ok(res, await admissionService.setEntranceExams(req.params.id, req.body.examNames));
});

export const listAdmissionCutoffs = asyncHandler(async (req, res) => {
  ok(res, await admissionService.listAdmissionCutoffsAdmin(req.params.id));
});

export const createAdmissionCutoff = asyncHandler(async (req, res) => {
  ok(res, await admissionService.createAdmissionCutoff(req.params.id, req.body), 201);
});

export const deleteAdmissionCutoff = asyncHandler(async (req, res) => {
  await admissionService.deleteAdmissionCutoff(req.params.id);
  ok(res, { removed: true });
});

// ───────────────────────── AI summary ─────────────────────────

export const regenerateAiSummary = asyncHandler(async (req, res) => {
  const summary = await generateInstitutionSummary(req.params.id);
  if (!summary) {
    throw AppError.badRequest('Not enough approved reviews yet, or ANTHROPIC_API_KEY is not configured');
  }
  ok(res, { aiSummary: summary });
});

export const listQuestionReports = asyncHandler(async (req, res) => {
  const result = await adminService.listQuestionReports(req.query.status as string | undefined, Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const dismissQuestionReport = asyncHandler(async (req, res) => {
  ok(res, await adminService.dismissQuestionReport(req.user!.id, req.params.id));
});

export const moderateQuestion = asyncHandler(async (req, res) => {
  ok(res, await adminService.moderateQuestionAction(req.user!.id, req.params.id, req.body.action, req.body.reason));
});

export const listAnswerReports = asyncHandler(async (req, res) => {
  const result = await adminService.listAnswerReports(req.query.status as string | undefined, Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const dismissAnswerReport = asyncHandler(async (req, res) => {
  ok(res, await adminService.dismissAnswerReport(req.user!.id, req.params.id));
});

export const moderateAnswer = asyncHandler(async (req, res) => {
  ok(res, await adminService.moderateAnswerAction(req.user!.id, req.params.id, req.body.action, req.body.reason));
});

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await adminService.listCategories();
  ok(res, categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await adminService.createCategory(req.body.name);
  ok(res, category, 201);
});

export const listInstitutions = asyncHandler(async (req, res) => {
  const status = req.query.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;
  const result = await adminService.listInstitutionsAdmin(Number(req.query.page) || 1, Number(req.query.pageSize) || 20, status, req.query.q as string | undefined);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const createInstitution = asyncHandler(async (req, res) => {
  const institution = await adminService.createInstitution(req.body);
  ok(res, institution, 201);
});

export const updateInstitution = asyncHandler(async (req, res) => {
  const institution = await adminService.updateInstitution(req.params.id, req.body);
  ok(res, institution);
});

export const decideInstitutionSubmission = asyncHandler(async (req, res) => {
  const institution = await adminService.decideInstitutionSubmission(req.params.id, req.user!.id, req.body.decision, req.body.reason);
  ok(res, institution);
});

export const setInstitutionFeatured = asyncHandler(async (req, res) => {
  const institution = await adminService.setInstitutionFeatured(req.params.id, req.body.featured);
  ok(res, institution);
});

export const recomputeRankings = asyncHandler(async (_req, res) => {
  const counts = await recomputeAllRankings();
  ok(res, counts);
});

export const listPayments = asyncHandler(async (req, res) => {
  const result = await adminService.listPaymentsAdmin(Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize, razorpayMode });
});

export const listJobs = asyncHandler(async (req, res) => {
  const result = await adminService.listJobsAdmin(Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const setJobStatus = asyncHandler(async (req, res) => {
  const job = await adminService.setJobStatus(req.user!.id, req.params.id, req.body.status);
  ok(res, job);
});

export const listFaqs = asyncHandler(async (_req, res) => {
  const faqs = await adminService.listFaqsAdmin();
  ok(res, faqs);
});

export const createFaq = asyncHandler(async (req, res) => {
  const faq = await adminService.createFaq(req.body);
  ok(res, faq, 201);
});

export const updateFaq = asyncHandler(async (req, res) => {
  const faq = await adminService.updateFaq(req.params.id, req.body);
  ok(res, faq);
});

export const deleteFaq = asyncHandler(async (req, res) => {
  await adminService.deleteFaq(req.params.id);
  ok(res, { deleted: true });
});

export const setUserRole = asyncHandler(async (req, res) => {
  const user = await adminService.setUserRole(req.user!.id, req.params.id, req.body.role, req.body.grant);
  ok(res, user);
});

export const getPlatformSettings = asyncHandler(async (_req, res) => {
  const settings = await adminService.readPlatformSettings();
  ok(res, settings);
});

export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.writePlatformSettings(req.user!.id, req.body);
  ok(res, settings);
});

export const reviewCoverage = asyncHandler(async (req, res) => {
  ok(res, await adminService.reviewCoverage((req.query.q as string | undefined)?.trim() || undefined));
});
