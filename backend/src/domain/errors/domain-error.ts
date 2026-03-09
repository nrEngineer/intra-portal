export enum ErrorCode {
  // Common
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CONFLICT = "CONFLICT",
  FORBIDDEN = "FORBIDDEN",

  // Auth
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  INVALID_TOKEN = "INVALID_TOKEN",
  EXPIRED_RESET_TOKEN = "EXPIRED_RESET_TOKEN",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  CANNOT_DELETE_SELF = "CANNOT_DELETE_SELF",
  INVALID_ROLE = "INVALID_ROLE",

  // Announcement
  ANNOUNCEMENT_NOT_FOUND = "ANNOUNCEMENT_NOT_FOUND",

  // Upload
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  TOO_MANY_FILES = "TOO_MANY_FILES",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  FILE_REQUIRED = "FILE_REQUIRED",

  // Document
  FOLDER_NOT_EMPTY = "FOLDER_NOT_EMPTY",
  FOLDER_NOT_FOUND = "FOLDER_NOT_FOUND",
  DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND",

  // Employee
  EMPLOYEE_NOT_FOUND = "EMPLOYEE_NOT_FOUND",

  // Schedule
  EVENT_NOT_FOUND = "EVENT_NOT_FOUND",
  TEAM_NOT_FOUND = "TEAM_NOT_FOUND",
  TEAM_ID_REQUIRED = "TEAM_ID_REQUIRED",

  // Link
  LINK_NOT_FOUND = "LINK_NOT_FOUND",
}

export class DomainError extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Concrete errors
export class ResourceNotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found: ${id}`);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, details);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.CONFLICT, message);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = "Forbidden") {
    super(ErrorCode.FORBIDDEN, message);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super(ErrorCode.INVALID_CREDENTIALS, "メールアドレスまたはパスワードが正しくありません");
  }
}

export class AccountLockedError extends DomainError {
  constructor() {
    super(ErrorCode.ACCOUNT_LOCKED, "アカウントがロックされています。15分後に再試行してください");
  }
}

export class InvalidTokenError extends DomainError {
  constructor(message: string = "無効なリフレッシュトークンです") {
    super(ErrorCode.INVALID_TOKEN, message);
  }
}

export class ExpiredResetTokenError extends DomainError {
  constructor(message: string = "無効または期限切れのトークンです") {
    super(ErrorCode.EXPIRED_RESET_TOKEN, message);
  }
}

export class InvalidPasswordError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.INVALID_PASSWORD, message);
  }
}

export class InvalidRoleError extends DomainError {
  constructor() {
    super(ErrorCode.INVALID_ROLE, "無効なロールです");
  }
}

export class CannotDeleteSelfError extends DomainError {
  constructor() {
    super(ErrorCode.CANNOT_DELETE_SELF, "Cannot delete yourself");
  }
}

export class FolderNotEmptyError extends DomainError {
  constructor() {
    super(ErrorCode.FOLDER_NOT_EMPTY, "フォルダが空でないか、見つかりません");
  }
}

export class TeamIdRequiredError extends DomainError {
  constructor() {
    super(ErrorCode.TEAM_ID_REQUIRED, "teamId is required");
  }
}
