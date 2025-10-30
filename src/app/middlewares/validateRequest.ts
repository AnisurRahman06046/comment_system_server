import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import httpStatus from 'http-status';
import { ApiError } from '../Errors/ApiError';

/**
 * Middleware to validate request using Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateRequest =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            'Validation Error',
            errorMessages,
          ),
        );
      } else {
        next(error);
      }
    }
  };
