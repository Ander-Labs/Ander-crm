import { describe, expect, it } from "vitest";

import { AppError, toPublicError } from "./app-error";

describe("application errors", () => {
  it("keeps a stable public error contract without exposing the cause", () => {
    const internalCause = new Error("database password leaked here");
    const error = new AppError("FORBIDDEN", { cause: internalCause });

    expect(toPublicError(error)).toEqual({
      code: "FORBIDDEN",
      message: "You are not allowed to perform this action.",
    });
    expect(error.cause).toBe(internalCause);
    expect(toPublicError(internalCause)).toEqual({
      code: "INTERNAL",
      message: "An unexpected error occurred.",
    });
  });
});
