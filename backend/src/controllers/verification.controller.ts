import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import * as verificationService from '../services/verification.service.js';
import { verificationDocumentStorageKey } from '../middlewares/upload.js';

export const start = asyncHandler(async (req, res) => {
  const result = await verificationService.startEmailVerification(
    req.user!.id,
    req.body.institutionId,
    req.body.relationship,
    req.body.universityEmail,
  );
  ok(res, result, 201);
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const result = await verificationService.verifyOtp(req.user!.id, req.body.institutionId, req.body.code);
  ok(res, { id: result.id, status: result.status });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const result = await verificationService.resendOtp(req.user!.id, req.body.institutionId);
  ok(res, result);
});

export const submitDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('A document file is required');
  const documentUrl = verificationDocumentStorageKey(req.file.filename);
  const result = await verificationService.startDocumentVerification(
    req.user!.id,
    req.body.institutionId,
    req.body.relationship,
    documentUrl,
    req.body.note,
  );
  ok(res, { id: result.id, status: result.status }, 201);
});

export const mine = asyncHandler(async (req, res) => {
  const rows = await verificationService.getMyVerifications(req.user!.id);
  ok(res, rows);
});

export const cancel = asyncHandler(async (req, res) => {
  const result = await verificationService.cancelPendingVerification(req.user!.id, req.body.institutionId);
  ok(res, { id: result.id, status: result.status });
});
