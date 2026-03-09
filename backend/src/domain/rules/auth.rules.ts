const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "パスワードは8文字以上必要です";
  if (!PASSWORD_REGEX.test(password)) return "パスワードは英字と数字を含む必要があります";
  return null;
}

export function isAccountLocked(lockedUntil: string | null): boolean {
  if (!lockedUntil) return false;
  return new Date(lockedUntil).getTime() > Date.now();
}

export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= MAX_LOGIN_ATTEMPTS;
}

export function calculateLockUntil(): string {
  return new Date(Date.now() + LOCK_DURATION_MS).toISOString();
}

export { PASSWORD_REGEX, MAX_LOGIN_ATTEMPTS, LOCK_DURATION_MS };
