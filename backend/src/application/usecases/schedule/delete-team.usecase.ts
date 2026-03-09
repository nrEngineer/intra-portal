import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";

export class DeleteTeamUseCase {
  async execute(id: string, uow: UnitOfWork): Promise<void> {
    const deleted = await uow.scheduleRepo.deleteTeam(id);

    if (!deleted) {
      throw new ResourceNotFoundError("Team", id);
    }
  }
}
