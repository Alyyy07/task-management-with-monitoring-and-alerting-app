export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(code: string, statusCode: number, message?: string) {
    super(message ?? code);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
    else this.stack = new Error(message).stack;
  }
}
