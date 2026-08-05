export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks "expected" errors (bad input, not found)
                                // vs. unexpected bugs/crashes
    Object.setPrototypeOf(this, AppError.prototype);
  }
}