import { Router } from 'express';
import * as questionController from '../controllers/question.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { reportLimiter } from '../middlewares/rateLimiters.js';
import { createAnswerSchema, createQuestionSchema, reportContentSchema } from '../validators/question.validator.js';

const router = Router();

router.get('/mine', authenticate, questionController.mine);
router.get('/institution/:institutionId', questionController.listForInstitution);
router.get('/:id', questionController.getOne);
router.post('/', authenticate, validate({ body: createQuestionSchema }), questionController.create);
router.post('/:id/answers', authenticate, validate({ body: createAnswerSchema }), questionController.answer);
router.post('/answers/:answerId/upvote', authenticate, questionController.upvoteAnswer);
router.post('/:id/report', authenticate, reportLimiter, validate({ body: reportContentSchema }), questionController.reportQuestion);
router.post('/answers/:answerId/report', authenticate, reportLimiter, validate({ body: reportContentSchema }), questionController.reportAnswer);

export default router;
