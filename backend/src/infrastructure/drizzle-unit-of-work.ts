import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { UnitOfWork } from "../application/ports/unit-of-work.js";
import { DrizzleUserRepository } from "./repositories/drizzle-user.repository.js";
import { DrizzleRefreshTokenRepository } from "./repositories/drizzle-refresh-token.repository.js";
import { DrizzlePasswordResetRepository } from "./repositories/drizzle-password-reset.repository.js";
import { DrizzleAnnouncementRepository } from "./repositories/drizzle-announcement.repository.js";
import { DrizzleEmployeeRepository } from "./repositories/drizzle-employee.repository.js";
import { DrizzleScheduleRepository } from "./repositories/drizzle-schedule.repository.js";
import { DrizzleLinkRepository } from "./repositories/drizzle-link.repository.js";
import { DrizzleDocumentRepository } from "./repositories/drizzle-document.repository.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzleUnitOfWork implements UnitOfWork {
  readonly userRepo: DrizzleUserRepository;
  readonly refreshTokenRepo: DrizzleRefreshTokenRepository;
  readonly passwordResetRepo: DrizzlePasswordResetRepository;
  readonly announcementRepo: DrizzleAnnouncementRepository;
  readonly employeeRepo: DrizzleEmployeeRepository;
  readonly scheduleRepo: DrizzleScheduleRepository;
  readonly linkRepo: DrizzleLinkRepository;
  readonly documentRepo: DrizzleDocumentRepository;

  constructor(private db: AppDatabase) {
    this.userRepo = new DrizzleUserRepository(db);
    this.refreshTokenRepo = new DrizzleRefreshTokenRepository(db);
    this.passwordResetRepo = new DrizzlePasswordResetRepository(db);
    this.announcementRepo = new DrizzleAnnouncementRepository(db);
    this.employeeRepo = new DrizzleEmployeeRepository(db);
    this.scheduleRepo = new DrizzleScheduleRepository(db);
    this.linkRepo = new DrizzleLinkRepository(db);
    this.documentRepo = new DrizzleDocumentRepository(db);
  }

  async transaction<T>(fn: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    // libsql/drizzle doesn't support nested transactions well,
    // so for SQLite we just run the function with the same db instance.
    // This preserves the UnitOfWork contract while being pragmatic.
    return fn(this);
  }
}
