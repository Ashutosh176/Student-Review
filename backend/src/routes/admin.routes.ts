import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/review.validator.js';
import {
  contentModerationActionSchema,
  createAdmissionCutoffSchema,
  createCategorySchema,
  createCourseSchema,
  createFaqSchema,
  createInstitutionSchema,
  updateInstitutionSchema,
  decisionSchema,
  institutionDomainParamSchema,
  moderateReviewActionSchema,
  paginationQuerySchema,
  revokeSchema,
  setEntranceExamsSchema,
  setFeaturedSchema,
  setJobStatusSchema,
  setUserRoleSchema,
  setUserStatusSchema,
  updateCourseSchema,
  updateFaqSchema,
  updatePlatformSettingsSchema,
} from '../validators/admin.validator.js';
import { addEmailDomainSchema } from '../validators/verification.validator.js';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'MODERATOR'));

router.get('/dashboard', adminController.dashboard);
router.get('/analytics', adminController.analytics);

router.get('/users', authorize('ADMIN'), validate({ query: paginationQuerySchema }), adminController.listUsers);
router.patch('/users/:id/status', authorize('ADMIN'), validate({ params: idParamSchema, body: setUserStatusSchema }), adminController.setUserStatus);
router.patch('/users/:id/roles', authorize('ADMIN'), validate({ params: idParamSchema, body: setUserRoleSchema }), adminController.setUserRole);

router.get('/moderation/queue', validate({ query: paginationQuerySchema }), adminController.moderationQueue);
router.post('/moderation/:id/action', validate({ params: idParamSchema, body: moderateReviewActionSchema }), adminController.moderateReview);

router.get('/reports', validate({ query: paginationQuerySchema }), adminController.listReports);
router.post('/reports/:id/dismiss', validate({ params: idParamSchema }), adminController.dismissReport);

router.get('/question-reports', validate({ query: paginationQuerySchema }), adminController.listQuestionReports);
router.post('/question-reports/:id/dismiss', validate({ params: idParamSchema }), adminController.dismissQuestionReport);
router.post(
  '/questions/:id/moderate',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: contentModerationActionSchema }),
  adminController.moderateQuestion,
);

router.get('/answer-reports', validate({ query: paginationQuerySchema }), adminController.listAnswerReports);
router.post('/answer-reports/:id/dismiss', validate({ params: idParamSchema }), adminController.dismissAnswerReport);
router.post(
  '/answers/:id/moderate',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: contentModerationActionSchema }),
  adminController.moderateAnswer,
);

router.get('/claims', validate({ query: paginationQuerySchema }), adminController.listClaims);
router.get('/claims/:id/document', validate({ params: idParamSchema }), adminController.downloadClaimDocument);
router.post('/claims/:id/decision', authorize('ADMIN'), validate({ params: idParamSchema, body: decisionSchema }), adminController.decideClaim);

router.get('/verifications', authorize('ADMIN'), validate({ query: paginationQuerySchema }), adminController.listVerifications);
router.get('/verifications/:id/document', authorize('ADMIN'), validate({ params: idParamSchema }), adminController.downloadVerificationDocument);
router.post('/verifications/:id/decision', authorize('ADMIN'), validate({ params: idParamSchema, body: decisionSchema }), adminController.decideVerification);
router.post('/verifications/:id/revoke', authorize('ADMIN'), validate({ params: idParamSchema, body: revokeSchema }), adminController.revokeVerification);

router.get('/categories', adminController.listCategories);
router.post('/categories', authorize('ADMIN'), validate({ body: createCategorySchema }), adminController.createCategory);

router.get('/institutions', validate({ query: paginationQuerySchema }), adminController.listInstitutions);
router.post('/institutions', authorize('ADMIN'), validate({ body: createInstitutionSchema }), adminController.createInstitution);
router.patch(
  '/institutions/:id',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: updateInstitutionSchema }),
  adminController.updateInstitution,
);
router.post(
  '/institutions/:id/decision',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: decisionSchema }),
  adminController.decideInstitutionSubmission,
);
router.patch(
  '/institutions/:id/featured',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: setFeaturedSchema }),
  adminController.setInstitutionFeatured,
);
router.get('/institutions/:id/email-domains', validate({ params: idParamSchema }), adminController.listEmailDomains);
router.post(
  '/institutions/:id/email-domains',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: addEmailDomainSchema }),
  adminController.addEmailDomain,
);
router.delete(
  '/institutions/:id/email-domains/:domainId',
  authorize('ADMIN'),
  validate({ params: institutionDomainParamSchema }),
  adminController.removeEmailDomain,
);

router.get('/institutions/:id/courses', validate({ params: idParamSchema }), adminController.listCourses);
router.post(
  '/institutions/:id/courses',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: createCourseSchema }),
  adminController.createCourse,
);
router.patch('/courses/:id', authorize('ADMIN'), validate({ params: idParamSchema, body: updateCourseSchema }), adminController.updateCourse);
router.delete('/courses/:id', authorize('ADMIN'), validate({ params: idParamSchema }), adminController.deleteCourse);

router.patch(
  '/institutions/:id/entrance-exams',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: setEntranceExamsSchema }),
  adminController.setEntranceExams,
);

router.get('/institutions/:id/admission-cutoffs', validate({ params: idParamSchema }), adminController.listAdmissionCutoffs);
router.post(
  '/institutions/:id/admission-cutoffs',
  authorize('ADMIN'),
  validate({ params: idParamSchema, body: createAdmissionCutoffSchema }),
  adminController.createAdmissionCutoff,
);
router.delete('/admission-cutoffs/:id', authorize('ADMIN'), validate({ params: idParamSchema }), adminController.deleteAdmissionCutoff);

router.post(
  '/institutions/:id/ai-summary/regenerate',
  authorize('ADMIN'),
  validate({ params: idParamSchema }),
  adminController.regenerateAiSummary,
);

router.post('/rankings/recompute', authorize('ADMIN'), adminController.recomputeRankings);
router.get('/review-coverage', adminController.reviewCoverage);

router.get('/payments', validate({ query: paginationQuerySchema }), adminController.listPayments);

router.get('/jobs', validate({ query: paginationQuerySchema }), adminController.listJobs);
router.patch('/jobs/:id/status', validate({ params: idParamSchema, body: setJobStatusSchema }), adminController.setJobStatus);

router.get('/settings', adminController.getPlatformSettings);
router.patch('/settings', authorize('ADMIN'), validate({ body: updatePlatformSettingsSchema }), adminController.updatePlatformSettings);

router.get('/faqs', adminController.listFaqs);
router.post('/faqs', authorize('ADMIN'), validate({ body: createFaqSchema }), adminController.createFaq);
router.patch('/faqs/:id', authorize('ADMIN'), validate({ params: idParamSchema, body: updateFaqSchema }), adminController.updateFaq);
router.delete('/faqs/:id', authorize('ADMIN'), validate({ params: idParamSchema }), adminController.deleteFaq);

export default router;
