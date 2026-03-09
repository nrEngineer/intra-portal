import type { EmailService } from "../../application/ports/services/email.service.js";

export class InMemoryEmailService implements EmailService {
  private emails: Array<{ to: string; subject: string; token: string }> = [];

  send(to: string, subject: string, token: string): void {
    this.emails.push({ to, subject, token });
  }

  getSentEmails() {
    return this.emails;
  }

  reset(): void {
    this.emails = [];
  }
}
