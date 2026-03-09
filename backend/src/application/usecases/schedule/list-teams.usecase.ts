import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListTeamsUseCase {
  async execute(uow: UnitOfWork, userId: string) {
    return uow.scheduleRepo.findTeamsByUserId(userId);
  }
}
