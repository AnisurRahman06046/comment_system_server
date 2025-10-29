/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../Errors/ApiError';

const globalErrorHanlders = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let validationErrors = undefined;

  // Handle ApiError
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    validationErrors = error.validationErrors;
  } else if (error.name === 'ValidationError') {
    // Handle Mongoose validation errors
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    // Handle Mongoose cast errors (invalid ObjectId)
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    // Handle MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (error.message) {
    message = error.message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(validationErrors && { errors: validationErrors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export default globalErrorHanlders;
