import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";

export class DeleteTeamUseCase {
  async execute(uow: UnitOfWork, id: string): Promise<void> {
    const deleted = await uow.scheduleRepo.deleteTeam(id);

    if (!deleted) {
      throw new ResourceNotFoundError("Team", id);
    }
  }
}
