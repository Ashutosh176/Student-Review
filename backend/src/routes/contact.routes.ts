import { Router } from 'express';
import { env } from '../config/env.js';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { authLimiter } from '../middlewares/rateLimiters.js';
import { prisma } from '../config/prisma.js';
import { sendEmail } from '../services/email.service.js';

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.enum(['General question', 'Report a problem', 'Institution inquiry']).default('General question'),
  message: z.string().min(10).max(2000),
});

const router = Router();

router.post(
  '/',
  authLimiter,
  validate({ body: contactSchema }),
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;
    await prisma.auditLog.create({
      data: { action: 'CONTACT_FORM_SUBMITTED', entityType: 'ContactMessage', metadata: { name, email, subject, message } },
    });
    // Include who wrote it (the body used to be the message alone, so there was
    // no way to answer), and set Reply-To so replying goes straight to them.
    await sendEmail({
      to: env.contactTo,
      replyTo: email,
      subject: `[Contact] ${subject} — ${name}`,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}\n\n(Reply to this email to answer ${name} directly.)`,
    });
    ok(res, { received: true }, 201);
  }),
);

export default router;
