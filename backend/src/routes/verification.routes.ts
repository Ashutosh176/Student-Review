import { Router } from 'express';
import * as verificationController from '../controllers/verification.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { verificationLimiter } from '../middlewares/rateLimiters.js';
import { uploadVerificationDocument } from '../middlewares/upload.js';
import {
  cancelVerificationSchema,
  resendOtpSchema,
  startDocumentVerificationSchema,
  startEmailVerificationSchema,
  verifyOtpSchema,
} from '../validators/verification.validator.js';

const router = Router();
router.use(authenticate);

router.get('/mine', verificationController.mine);
router.post('/start', verificationLimiter, validate({ body: startEmailVerificationSchema }), verificationController.start);
router.post('/verify-otp', verificationLimiter, validate({ body: verifyOtpSchema }), verificationController.verifyOtp);
router.post('/resend-otp', verificationLimiter, validate({ body: resendOtpSchema }), verificationController.resendOtp);
router.post('/cancel', verificationLimiter, validate({ body: cancelVerificationSchema }), verificationController.cancel);
router.post(
  '/document',
  verificationLimiter,
  uploadVerificationDocument,
  validate({ body: startDocumentVerificationSchema }),
  verificationController.submitDocument,
);

export default router;
