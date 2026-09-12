import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Local-disk storage for dev (spec §39: "Local storage during development.
// Use S3-compatible/free-tier object storage later."). Files land outside
// any express.static root — they are never publicly reachable by URL, only
// through the authenticated download route in admin.routes.ts, since a claim
// document can contain identifying business/KYC information.
const CLAIMS_DIR = path.join(process.cwd(), env.upload.dir, 'claims');
const VERIFICATIONS_DIR = path.join(process.cwd(), env.upload.dir, 'verifications');

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(CLAIMS_DIR, { recursive: true });
    cb(null, CLAIMS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadClaimDocument = multer({
  storage,
  limits: { fileSize: env.upload.maxMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError('Only PDF, PNG, or JPEG files are allowed', 400));
      return;
    }
    cb(null, true);
  },
}).single('document');

// Storage key persisted on OrganizationClaim.documentUrl — a relative path,
// not a public URL. Resolved back to an absolute path only by the admin
// download route, which also re-checks it stays inside CLAIMS_DIR.
export function claimDocumentStorageKey(filename: string): string {
  return path.join('claims', filename);
}

export function resolveClaimDocumentPath(storageKey: string): string {
  const base = path.join(process.cwd(), env.upload.dir);
  const resolved = path.resolve(base, storageKey);
  if (!resolved.startsWith(path.resolve(base) + path.sep)) {
    throw AppError.badRequest('Invalid document reference');
  }
  return resolved;
}

// Same pattern as the claim-document upload above, for student verification
// ID cards / degree certificates — also never publicly reachable, only via
// the authenticated admin download route.
const verificationStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(VERIFICATIONS_DIR, { recursive: true });
    cb(null, VERIFICATIONS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadVerificationDocument = multer({
  storage: verificationStorage,
  limits: { fileSize: env.upload.maxMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError('Only PDF, PNG, or JPEG files are allowed', 400));
      return;
    }
    cb(null, true);
  },
}).single('document');

export function verificationDocumentStorageKey(filename: string): string {
  return path.join('verifications', filename);
}

export function resolveVerificationDocumentPath(storageKey: string): string {
  const base = path.join(process.cwd(), env.upload.dir);
  const resolved = path.resolve(base, storageKey);
  if (!resolved.startsWith(path.resolve(base) + path.sep)) {
    throw AppError.badRequest('Invalid document reference');
  }
  return resolved;
}
