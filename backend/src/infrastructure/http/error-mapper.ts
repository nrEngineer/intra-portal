import type { Context, ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ErrorCode, DomainError } from "../../domain/errors/domain-error.js";

const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.ACCOUNT_LOCKED]: 423,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.EXPIRED_RESET_TOKEN]: 400,
  [ErrorCode.INVALID_PASSWORD]: 400,
  [ErrorCode.CANNOT_DELETE_SELF]: 400,
  [ErrorCode.INVALID_ROLE]: 400,
  [ErrorCode.ANNOUNCEMENT_NOT_FOUND]: 404,
  [ErrorCode.FILE_TOO_LARGE]: 400,
  [ErrorCode.TOO_MANY_FILES]: 400,
  [ErrorCode.INVALID_FILE_TYPE]: 400,
  [ErrorCode.FILE_REQUIRED]: 400,
  [ErrorCode.FOLDER_NOT_EMPTY]: 400,
  [ErrorCode.FOLDER_NOT_FOUND]: 404,
  [ErrorCode.DOCUMENT_NOT_FOUND]: 404,
  [ErrorCode.EMPLOYEE_NOT_FOUND]: 404,
  [ErrorCode.EVENT_NOT_FOUND]: 404,
  [ErrorCode.TEAM_NOT_FOUND]: 404,
  [ErrorCode.TEAM_ID_REQUIRED]: 400,
  [ErrorCode.LINK_NOT_FOUND]: 404,
};

/** Global Hono error handler — maps DomainError to HTTP status */
export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof DomainError) {
    const status = ERROR_STATUS_MAP[err.errorCode] ?? 500;
    return c.json({ error: err.message }, status as ContentfulStatusCode);
  }
  return c.json({ error: "Internal Server Error" }, 500);
};
