class ApiError extends Error {
  statusCode: number;
  validationErrors?: any;

  constructor(
    statusCode: number,
    message: string | undefined,
    validationErrors?: any,
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
  