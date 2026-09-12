import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import * as adminService from '../services/admin.service.js';

export const list = asyncHandler(async (_req, res) => {
  const faqs = await adminService.listPublishedFaqs();
  ok(res, faqs);
});
