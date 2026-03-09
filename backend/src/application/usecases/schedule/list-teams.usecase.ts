import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListTeamsUseCase {
  async execute(userId: string, uow: UnitOfWork) {
    return uow.scheduleRepo.findTeamsByUserId(userId);
  }
}
