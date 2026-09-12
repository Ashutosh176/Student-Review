import { Router } from 'express';
import * as institutionController from '../controllers/institution.controller.js';
import * as claimController from '../controllers/organization.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadClaimDocument } from '../middlewares/upload.js';
import {
  compareQuerySchema,
  listInstitutionsQuerySchema,
  reviewsQuerySchema,
  searchQuerySchema,
  slugParamSchema,
} from '../validators/institution.validator.js';
import { createInstitutionSchema } from '../validators/admin.validator.js';
import { createClaimSchema } from '../validators/organization.validator.js';
import { idParamSchema } from '../validators/review.validator.js';

const router = Router();

router.get('/', validate({ query: listInstitutionsQuerySchema }), institutionController.list);
router.post('/', authenticate, validate({ body: createInstitutionSchema }), institutionController.submit);
router.get('/stats', institutionController.stats);
router.get('/filters', institutionController.filters);
router.get('/search', validate({ query: searchQuerySchema }), institutionController.search);
router.get('/compare', validate({ query: compareQuerySchema }), institutionController.compare);
router.get('/:slug', validate({ params: slugParamSchema }), institutionController.getBySlug);
router.get('/:slug/reviews', validate({ params: slugParamSchema, query: reviewsQuerySchema }), institutionController.institutionReviews);
router.get('/:slug/jobs', validate({ params: slugParamSchema }), institutionController.institutionJobs);
router.get('/:slug/questions', validate({ params: slugParamSchema }), institutionController.institutionQuestions);

router.post(
  '/:id/claim',
  authenticate,
  uploadClaimDocument,
  validate({ params: idParamSchema, body: createClaimSchema.omit({ institutionId: true, documentUrl: true }) }),
  claimController.submitClaim,
);

export default router;
