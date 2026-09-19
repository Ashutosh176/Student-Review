import { Router } from 'express';
import * as orgController from '../controllers/organization.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  checkoutSchema,
  createJobSchema,
  inviteMemberSchema,
  updateOrgProfileSchema,
  verifyPaymentSchema,
} from '../validators/organization.validator.js';

const router = Router();

// Invite accept flow runs before the invitee has the ORGANIZATION role, so
// these two must stay ahead of the router-wide authorize('ORGANIZATION') gate.
// Public: powers the marketing /pricing page (no account needed).
router.get('/public-plan-prices', orgController.planPrices);
router.get('/invites/:token', orgController.getInvite);
router.post('/invites/:token/accept', authenticate, orgController.acceptInvite);

router.use(authenticate, authorize('ORGANIZATION'));

router.get('/me', orgController.myOrganization);
router.patch('/profile', validate({ body: updateOrgProfileSchema }), orgController.updateProfile);
router.get('/members', orgController.listMembers);
router.post('/members', validate({ body: inviteMemberSchema }), orgController.inviteMember);
router.delete('/members/:memberId', orgController.removeMember);
router.get('/plan-prices', orgController.planPrices);
router.get('/billing', orgController.billing);
router.post('/billing/checkout', validate({ body: checkoutSchema }), orgController.createCheckout);
router.post('/billing/verify', validate({ body: verifyPaymentSchema }), orgController.verifyCheckout);
router.get('/analytics', orgController.analytics);
router.get('/sentiment', orgController.sentiment);
router.get('/jobs', orgController.listJobs);
router.post('/jobs', validate({ body: createJobSchema }), orgController.createJob);
router.post('/jobs/:jobId/publish', orgController.publishJob);

export default router;
