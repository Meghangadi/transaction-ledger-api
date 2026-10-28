
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const statusCode = error.statusCode ?? 500;

  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : error.message,
  });
}
