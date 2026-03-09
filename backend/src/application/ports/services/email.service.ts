export interface EmailService {
  send(to: string, subject: string, token: string): void;
  getSentEmails(): Array<{ to: string; subject: string; token: string }>;
  reset(): void;
}
