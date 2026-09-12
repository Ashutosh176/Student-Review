import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import * as paymentService from '../services/payment.service.js';

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  // app.ts's express.json({ verify }) always captures this for a JSON body —
  // reconstructing one from req.body would fail signature verification
  // anyway, so a missing rawBody means the request wasn't sent as JSON.
  if (!req.rawBody) throw AppError.badRequest('Expected a JSON request body');
  const result = await paymentService.handleWebhookEvent(req.rawBody, signature);
  ok(res, result);
});
