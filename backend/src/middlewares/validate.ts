import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

type Schemas = Partial<Record<'body' | 'query' | 'params', ZodTypeAny>>;

// Never trust frontend validation — every mutating route runs its payload
// through a zod schema here before it reaches a controller (spec §26).
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
    if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
    next();
  };
}
