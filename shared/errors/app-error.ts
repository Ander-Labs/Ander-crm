export type AppErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_FAILED"
  | "DEPENDENCY_UNAVAILABLE"
  | "INTERNAL";

const publicMessages: Record<AppErrorCode, string> = {
  UNAUTHENTICATED: "Authentication is required.",
  FORBIDDEN: "You are not allowed to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "The request conflicts with the current resource state.",
  VALIDATION_FAILED: "The request contains invalid data.",
  DEPENDENCY_UNAVAILABLE: "A required service is temporarily unavailable.",
  INTERNAL: "An unexpected error occurred.",
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly publicMessage: string;

  constructor(code: AppErrorCode, options?: { cause?: unknown }) {
    super(publicMessages[code], { cause: options?.cause });
    this.name = "AppError";
    this.code = code;
    this.publicMessage = publicMessages[code];
  }
}

export function toPublicError(error: unknown): {
  code: AppErrorCode;
  message: string;
} {
  if (error instanceof AppError) {
    return { code: error.code, message: error.publicMessage };
  }

  return { code: "INTERNAL", message: publicMessages.INTERNAL };
}
