/** Email service interface for dependency inversion */
export interface EmailServiceInterface {
  send(to: string, subject: string, token: string): void;
  getSentEmails(): Array<{ to: string; subject: string; token: string }>;
  reset(): void;
}

/** In-memory implementation for development and testing */
class InMemoryEmailService implements EmailServiceInterface {
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

/** Singleton instance — swap out for production email service as needed */
export const emailService: EmailServiceInterface = new InMemoryEmailService();
