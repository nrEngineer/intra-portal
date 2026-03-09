import type { UnitOfWork } from "../application/ports/unit-of-work.js";
import type { HashService } from "../application/ports/services/hash.service.js";
import type { TokenService } from "../application/ports/services/token.service.js";
import type { EmailService } from "../application/ports/services/email.service.js";
import type { StorageService } from "../application/ports/services/storage.service.js";

// Auth UseCases
import { LoginUseCase } from "../application/usecases/auth/login.usecase.js";
import { RegisterUseCase } from "../application/usecases/auth/register.usecase.js";
import { RefreshTokenUseCase } from "../application/usecases/auth/refresh-token.usecase.js";
import { LogoutUseCase } from "../application/usecases/auth/logout.usecase.js";
import { ResetPasswordRequestUseCase } from "../application/usecases/auth/reset-password-request.usecase.js";
import { ResetPasswordExecuteUseCase } from "../application/usecases/auth/reset-password-execute.usecase.js";
import { GetProfileUseCase } from "../application/usecases/auth/get-profile.usecase.js";
import { UpdateProfileUseCase } from "../application/usecases/auth/update-profile.usecase.js";
import { ListUsersUseCase } from "../application/usecases/auth/list-users.usecase.js";
import { ChangeRoleUseCase } from "../application/usecases/auth/change-role.usecase.js";
import { DeleteUserUseCase } from "../application/usecases/auth/delete-user.usecase.js";

// Announcement UseCases
import { ListAnnouncementsUseCase } from "../application/usecases/announcement/list-announcements.usecase.js";
import { GetAnnouncementUseCase } from "../application/usecases/announcement/get-announcement.usecase.js";
import { CreateAnnouncementUseCase } from "../application/usecases/announcement/create-announcement.usecase.js";
import { UpdateAnnouncementUseCase } from "../application/usecases/announcement/update-announcement.usecase.js";
import { DeleteAnnouncementUseCase } from "../application/usecases/announcement/delete-announcement.usecase.js";
import { GetUnreadCountUseCase } from "../application/usecases/announcement/get-unread-count.usecase.js";

// Employee UseCases
import { ListEmployeesUseCase } from "../application/usecases/employee/list-employees.usecase.js";
import { RegisterEmployeeUseCase } from "../application/usecases/employee/register-employee.usecase.js";
import { UpdateEmployeeUseCase } from "../application/usecases/employee/update-employee.usecase.js";

// Schedule UseCases
import { ListTeamsUseCase } from "../application/usecases/schedule/list-teams.usecase.js";
import { CreateTeamUseCase } from "../application/usecases/schedule/create-team.usecase.js";
import { UpdateTeamUseCase } from "../application/usecases/schedule/update-team.usecase.js";
import { DeleteTeamUseCase } from "../application/usecases/schedule/delete-team.usecase.js";
import { ListEventsUseCase } from "../application/usecases/schedule/list-events.usecase.js";
import { CreateEventUseCase } from "../application/usecases/schedule/create-event.usecase.js";
import { UpdateEventUseCase } from "../application/usecases/schedule/update-event.usecase.js";
import { DeleteEventUseCase } from "../application/usecases/schedule/delete-event.usecase.js";

// Link UseCases
import { ListLinksUseCase } from "../application/usecases/link/list-links.usecase.js";
import { CreateLinkUseCase } from "../application/usecases/link/create-link.usecase.js";
import { UpdateLinkUseCase } from "../application/usecases/link/update-link.usecase.js";
import { DeleteLinkUseCase } from "../application/usecases/link/delete-link.usecase.js";
import { ListCategoriesUseCase } from "../application/usecases/link/list-categories.usecase.js";

// Document UseCases
import { ListFoldersUseCase } from "../application/usecases/document/list-folders.usecase.js";
import { CreateFolderUseCase } from "../application/usecases/document/create-folder.usecase.js";
import { UpdateFolderUseCase } from "../application/usecases/document/update-folder.usecase.js";
import { DeleteFolderUseCase } from "../application/usecases/document/delete-folder.usecase.js";
import { ListDocumentsUseCase } from "../application/usecases/document/list-documents.usecase.js";
import { CreateDocumentUseCase } from "../application/usecases/document/create-document.usecase.js";
import { UpdateDocumentUseCase } from "../application/usecases/document/update-document.usecase.js";
import { DeleteDocumentUseCase } from "../application/usecases/document/delete-document.usecase.js";
import { GetVersionHistoryUseCase } from "../application/usecases/document/get-version-history.usecase.js";
import { SearchDocumentsUseCase } from "../application/usecases/document/search-documents.usecase.js";

// Infrastructure
import { BcryptHashService } from "../infrastructure/services/bcrypt-hash.service.js";
import { JwtTokenService } from "../infrastructure/services/jwt-token.service.js";
import { InMemoryEmailService } from "../infrastructure/services/in-memory-email.service.js";
import { DrizzleUnitOfWork } from "../infrastructure/drizzle-unit-of-work.js";
import { getDb } from "../infrastructure/db/connection.js";
import { storage } from "../infrastructure/services/storage.js";

export interface Container {
  // Services
  hashService: HashService;
  tokenService: TokenService;
  emailService: EmailService;
  storageService: StorageService;

  // UnitOfWork factory
  createUnitOfWork(): UnitOfWork;

  // Auth UseCases
  loginUseCase: LoginUseCase;
  registerUseCase: RegisterUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  logoutUseCase: LogoutUseCase;
  resetPasswordRequestUseCase: ResetPasswordRequestUseCase;
  resetPasswordExecuteUseCase: ResetPasswordExecuteUseCase;
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  listUsersUseCase: ListUsersUseCase;
  changeRoleUseCase: ChangeRoleUseCase;
  deleteUserUseCase: DeleteUserUseCase;

  // Announcement UseCases
  listAnnouncementsUseCase: ListAnnouncementsUseCase;
  getAnnouncementUseCase: GetAnnouncementUseCase;
  createAnnouncementUseCase: CreateAnnouncementUseCase;
  updateAnnouncementUseCase: UpdateAnnouncementUseCase;
  deleteAnnouncementUseCase: DeleteAnnouncementUseCase;
  getUnreadCountUseCase: GetUnreadCountUseCase;

  // Employee UseCases
  listEmployeesUseCase: ListEmployeesUseCase;
  registerEmployeeUseCase: RegisterEmployeeUseCase;
  updateEmployeeUseCase: UpdateEmployeeUseCase;

  // Schedule UseCases
  listTeamsUseCase: ListTeamsUseCase;
  createTeamUseCase: CreateTeamUseCase;
  updateTeamUseCase: UpdateTeamUseCase;
  deleteTeamUseCase: DeleteTeamUseCase;
  listEventsUseCase: ListEventsUseCase;
  createEventUseCase: CreateEventUseCase;
  updateEventUseCase: UpdateEventUseCase;
  deleteEventUseCase: DeleteEventUseCase;

  // Link UseCases
  listLinksUseCase: ListLinksUseCase;
  createLinkUseCase: CreateLinkUseCase;
  updateLinkUseCase: UpdateLinkUseCase;
  deleteLinkUseCase: DeleteLinkUseCase;
  listCategoriesUseCase: ListCategoriesUseCase;

  // Document UseCases
  listFoldersUseCase: ListFoldersUseCase;
  createFolderUseCase: CreateFolderUseCase;
  updateFolderUseCase: UpdateFolderUseCase;
  deleteFolderUseCase: DeleteFolderUseCase;
  listDocumentsUseCase: ListDocumentsUseCase;
  createDocumentUseCase: CreateDocumentUseCase;
  updateDocumentUseCase: UpdateDocumentUseCase;
  deleteDocumentUseCase: DeleteDocumentUseCase;
  getVersionHistoryUseCase: GetVersionHistoryUseCase;
  searchDocumentsUseCase: SearchDocumentsUseCase;
}

export function createContainer(): Container {
  const hashService = new BcryptHashService();
  const tokenService = new JwtTokenService();
  const emailService = new InMemoryEmailService();
  const storageService = storage;

  const createUnitOfWork = () => new DrizzleUnitOfWork(getDb() as any);

  return {
    hashService,
    tokenService,
    emailService,
    storageService,
    createUnitOfWork,

    // Auth
    loginUseCase: new LoginUseCase(hashService, tokenService),
    registerUseCase: new RegisterUseCase(hashService),
    refreshTokenUseCase: new RefreshTokenUseCase(tokenService),
    logoutUseCase: new LogoutUseCase(),
    resetPasswordRequestUseCase: new ResetPasswordRequestUseCase(emailService),
    resetPasswordExecuteUseCase: new ResetPasswordExecuteUseCase(hashService),
    getProfileUseCase: new GetProfileUseCase(),
    updateProfileUseCase: new UpdateProfileUseCase(),
    listUsersUseCase: new ListUsersUseCase(),
    changeRoleUseCase: new ChangeRoleUseCase(),
    deleteUserUseCase: new DeleteUserUseCase(),

    // Announcement
    listAnnouncementsUseCase: new ListAnnouncementsUseCase(),
    getAnnouncementUseCase: new GetAnnouncementUseCase(),
    createAnnouncementUseCase: new CreateAnnouncementUseCase(),
    updateAnnouncementUseCase: new UpdateAnnouncementUseCase(),
    deleteAnnouncementUseCase: new DeleteAnnouncementUseCase(),
    getUnreadCountUseCase: new GetUnreadCountUseCase(),

    // Employee
    listEmployeesUseCase: new ListEmployeesUseCase(),
    registerEmployeeUseCase: new RegisterEmployeeUseCase(),
    updateEmployeeUseCase: new UpdateEmployeeUseCase(),

    // Schedule
    listTeamsUseCase: new ListTeamsUseCase(),
    createTeamUseCase: new CreateTeamUseCase(),
    updateTeamUseCase: new UpdateTeamUseCase(),
    deleteTeamUseCase: new DeleteTeamUseCase(),
    listEventsUseCase: new ListEventsUseCase(),
    createEventUseCase: new CreateEventUseCase(),
    updateEventUseCase: new UpdateEventUseCase(),
    deleteEventUseCase: new DeleteEventUseCase(),

    // Link
    listLinksUseCase: new ListLinksUseCase(),
    createLinkUseCase: new CreateLinkUseCase(),
    updateLinkUseCase: new UpdateLinkUseCase(),
    deleteLinkUseCase: new DeleteLinkUseCase(),
    listCategoriesUseCase: new ListCategoriesUseCase(),

    // Document
    listFoldersUseCase: new ListFoldersUseCase(),
    createFolderUseCase: new CreateFolderUseCase(),
    updateFolderUseCase: new UpdateFolderUseCase(),
    deleteFolderUseCase: new DeleteFolderUseCase(),
    listDocumentsUseCase: new ListDocumentsUseCase(),
    createDocumentUseCase: new CreateDocumentUseCase(),
    updateDocumentUseCase: new UpdateDocumentUseCase(),
    deleteDocumentUseCase: new DeleteDocumentUseCase(),
    getVersionHistoryUseCase: new GetVersionHistoryUseCase(),
    searchDocumentsUseCase: new SearchDocumentsUseCase(),
  };
}
