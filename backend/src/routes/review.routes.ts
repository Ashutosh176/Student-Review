import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { reportLimiter, reviewSubmitLimiter } from '../middlewares/rateLimiters.js';
import {
  createReviewSchema,
  idParamSchema,
  reportReviewSchema,
  respondReviewSchema,
  updateReviewSchema,
} from '../validators/review.validator.js';

const router = Router();

router.get('/latest', reviewController.latest);
router.get('/mine', authenticate, reviewController.myReviews);

router.post('/', authenticate, reviewSubmitLimiter, validate({ body: createReviewSchema }), reviewController.create);
router.patch('/:id', authenticate, validate({ params: idParamSchema, body: updateReviewSchema }), reviewController.update);
router.delete('/:id', authenticate, validate({ params: idParamSchema }), reviewController.remove);
router.post(
  '/:id/report',
  authenticate,
  reportLimiter,
  validate({ params: idParamSchema, body: reportReviewSchema }),
  reviewController.report,
);
router.post('/:id/vote', authenticate, validate({ params: idParamSchema }), reviewController.vote);
router.post(
  '/:id/respond',
  authenticate,
  authorize('ORGANIZATION'),
  validate({ params: idParamSchema, body: respondReviewSchema }),
  reviewController.respond,
);

export default router;
