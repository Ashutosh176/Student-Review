// Populated by app.ts's express.json({ verify }) so the Razorpay webhook can
// check its HMAC signature against the exact bytes Razorpay sent.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

export {};
