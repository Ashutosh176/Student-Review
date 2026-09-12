import pino from 'pino';
import { env } from './env.js';

// Redact anything that could leak credentials or verification evidence.
export const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      '*.password',
      '*.passwordHash',
      '*.token',
      'evidenceRef',
      'documentUrl',
    ],
    censor: '[redacted]',
  },
  transport: env.isProd
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
});
