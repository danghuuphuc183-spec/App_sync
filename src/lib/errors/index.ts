export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INSUFFICIENT_TRUST"
  | "UNDERAGE"
  | "ROOKIE_RESTRICTION"
  | "INTERNAL_SERVER_ERROR"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly messageVi: string;
  public override readonly cause?: unknown;

  constructor(code: ErrorCode, messageVi: string, cause?: unknown) {
    super(messageVi);
    this.name = "AppError";
    this.code = code;
    this.messageVi = messageVi;
    this.cause = cause;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.messageVi,
    };
  }
}

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { success: false, error };
}
