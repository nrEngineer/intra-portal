// Backward compatibility shim — delegates to new architecture
// Tests import getSentEmails/resetSentEmails from this module
import { container } from "./app.js";

export function getSentEmails() {
  return container.emailService.getSentEmails();
}

export function resetSentEmails() {
  container.emailService.reset();
}
