// Taken from zod-express-middleware: https://github.com/Aquila169/zod-express-middleware

import { ZodError, ZodSchema } from 'zod';

import ApiError from './api-error';

type RequestValidation<TParams, TQuery, TBody> = {
  params?: ZodSchema<TParams>;
  query?: ZodSchema<TQuery>;
  body?: ZodSchema<TBody>;
};

type ErrorListItem = {
  type: 'Query' | 'Params' | 'Body';
  errors: ZodError<any>;
};

export const validateRequest = (
  req: any,
  schemas: RequestValidation<any, any, any>
) => {
  const { params, query, body } = schemas;
  const errors: Array<ErrorListItem> = [];

  if (params) {
    const parsed = params.safeParse(req.params);
    if (!parsed.success) {
      errors.push({ type: 'Params', errors: parsed.error });
    }
  }

  if (query) {
    const parsed = query.safeParse(req.query);
    if (!parsed.success) {
      errors.push({ type: 'Query', errors: parsed.error });
    }
  }

  if (body) {
    const parsed = body.safeParse(req.body);
    if (!parsed.success) {
      errors.push({ type: 'Body', errors: parsed.error });
    }
  }

  if (errors.length > 0) {
    const message = JSON.stringify(
      [
        `[${errors[0].type}]`,
        `[${errors[0].errors.issues[0].path[0]}]`,
        errors[0].errors.issues[0].message,
      ].join(' ')
    );

    throw ApiError.badRequest(message);
  }
};

export default validateRequest;
