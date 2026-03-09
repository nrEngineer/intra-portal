import type { UserRepository } from "./repositories/user.repository.js";
import type { RefreshTokenRepository } from "./repositories/refresh-token.repository.js";
import type { PasswordResetRepository } from "./repositories/password-reset.repository.js";
import type { AnnouncementRepository } from "./repositories/announcement.repository.js";
import type { EmployeeRepository } from "./repositories/employee.repository.js";
import type { ScheduleRepository } from "./repositories/schedule.repository.js";
import type { LinkRepository } from "./repositories/link.repository.js";
import type { DocumentRepository } from "./repositories/document.repository.js";

export interface UnitOfWork {
  readonly userRepo: UserRepository;
  readonly refreshTokenRepo: RefreshTokenRepository;
  readonly passwordResetRepo: PasswordResetRepository;
  readonly announcementRepo: AnnouncementRepository;
  readonly employeeRepo: EmployeeRepository;
  readonly scheduleRepo: ScheduleRepository;
  readonly linkRepo: LinkRepository;
  readonly documentRepo: DocumentRepository;

  transaction<T>(fn: (uow: UnitOfWork) => Promise<T>): Promise<T>;
}
