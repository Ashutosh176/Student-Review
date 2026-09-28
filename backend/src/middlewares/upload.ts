import fs from 'node:fs';
import path from 'node:path';
import type { Response } from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

// Claim letters and student verification documents (ID cards, degree
// certificates) are held in memory during the request and stored in Postgres
// (StoredDocument) — never on the web server's disk (ephemeral on most hosts)
// and never at a public URL. They're only reachable through the authenticated
// admin download routes, and erased with the owner's account.
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

function documentUpload() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: env.upload.maxMb * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(new AppError('Only PDF, PNG, or JPEG files are allowed', 400));
        return;
      }
      cb(null, true);
    },
  }).single('document');
}

export const uploadClaimDocument = documentUpload();
export const uploadVerificationDocument = documentUpload();

// ───────────── College logos ─────────────
// Unlike the documents above, logos are public: stored in the same table but
// served by GET /api/institutions/logos/:id, which only serves a row that some
// institution's logoUrl actually points at — so a private document can never
// be read through it, even with its id.
export const LOGO_URL_PREFIX = '/institution-logos/';
const LOGO_MAX_BYTES = 1024 * 1024;
const LOGO_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export const uploadLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LOGO_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!LOGO_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError('Logo must be a PNG, JPEG, or WebP image', 400));
      return;
    }
    cb(null, true);
  },
}).single('logo');

function sniffImage(buf: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  const m = sniffMime(buf);
  if (m === 'image/png' || m === 'image/jpeg') return m;
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  return null;
}

/** Stores a logo image and returns the public logoUrl to save on the institution. */
export async function storeLogoImage(file: Express.Multer.File): Promise<string> {
  const mimeType = sniffImage(file.buffer);
  if (!mimeType) throw AppError.badRequest('That file is not a valid PNG, JPEG, or WebP image');
  const doc = await prisma.storedDocument.create({
    data: { mimeType, sizeBytes: file.buffer.length, data: file.buffer },
    select: { id: true },
  });
  return `${LOGO_URL_PREFIX}${doc.id}`;
}

/** Deletes a logo previously stored by storeLogoImage; ignores static /college-logos files. */
export async function deleteLogoImage(logoUrl: string | null | undefined): Promise<void> {
  if (!logoUrl?.startsWith(LOGO_URL_PREFIX)) return;
  await prisma.storedDocument.deleteMany({ where: { id: logoUrl.slice(LOGO_URL_PREFIX.length) } });
}

/** Serves a logo publicly. 404s unless an institution currently uses this exact logo. */
export async function sendLogoImage(res: Response, id: string): Promise<void> {
  const logoUrl = `${LOGO_URL_PREFIX}${id}`;
  const inUse = await prisma.institution.findFirst({ where: { logoUrl }, select: { id: true } });
  if (!inUse) throw AppError.notFound('Logo not found');
  const doc = await prisma.storedDocument.findUnique({ where: { id } });
  if (!doc || !LOGO_MIME_TYPES.has(doc.mimeType)) throw AppError.notFound('Logo not found');
  res.set('Content-Type', doc.mimeType);
  res.set('X-Content-Type-Options', 'nosniff');
  // A replaced logo gets a new id, so each URL's bytes never change.
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(Buffer.from(doc.data));
}

// The client-declared Content-Type is not trustworthy; check the real bytes.
function sniffMime(buf: Buffer): 'application/pdf' | 'image/png' | 'image/jpeg' | null {
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  return null;
}

const DB_PREFIX = 'db:';

/** Persists an uploaded file and returns the opaque storage key kept on the owning row. */
export async function storeUploadedDocument(file: Express.Multer.File): Promise<string> {
  const mimeType = sniffMime(file.buffer);
  if (!mimeType) throw AppError.badRequest('That file is not a valid PDF, PNG, or JPEG');
  const doc = await prisma.storedDocument.create({
    data: { mimeType, sizeBytes: file.buffer.length, data: file.buffer },
    select: { id: true },
  });
  return `${DB_PREFIX}${doc.id}`;
}

export async function deleteStoredDocument(key: string | null | undefined): Promise<void> {
  if (!key) return;
  if (key.startsWith(DB_PREFIX)) {
    await prisma.storedDocument.deleteMany({ where: { id: key.slice(DB_PREFIX.length) } });
    return;
  }
  // Legacy on-disk document from before database storage.
  try {
    fs.rmSync(resolveLegacyPath(key), { force: true });
  } catch {
    // Invalid or missing legacy path — nothing to erase.
  }
}

function resolveLegacyPath(storageKey: string): string {
  const base = path.resolve(process.cwd(), env.upload.dir);
  const resolved = path.resolve(base, storageKey);
  if (!resolved.startsWith(base + path.sep)) throw AppError.badRequest('Invalid document reference');
  return resolved;
}

const EXT: Record<string, string> = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg' };

/** Streams a stored document to an (already authorized) admin as an attachment. */
export async function sendStoredDocument(res: Response, key: string): Promise<void> {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Cache-Control', 'no-store');

  if (key.startsWith(DB_PREFIX)) {
    const doc = await prisma.storedDocument.findUnique({ where: { id: key.slice(DB_PREFIX.length) } });
    if (!doc) throw AppError.notFound('Document file is missing from storage');
    res.set('Content-Type', doc.mimeType);
    res.set('Content-Disposition', `attachment; filename="document.${EXT[doc.mimeType] ?? 'bin'}"`);
    res.send(Buffer.from(doc.data));
    return;
  }

  const absolutePath = resolveLegacyPath(key);
  if (!fs.existsSync(absolutePath)) throw AppError.notFound('Document file is missing from storage');
  res.download(absolutePath);
}
