export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Add a toJSON method for better serialization
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack
    };
  }
}