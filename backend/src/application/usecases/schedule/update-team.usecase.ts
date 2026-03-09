import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";

export class UpdateTeamUseCase {
  async execute(uow: UnitOfWork, id: string, name: string) {
    const updated = await uow.scheduleRepo.updateTeam(id, name);

    if (!updated) {
      throw new ResourceNotFoundError("Team", id);
    }

    return updated;
  }
}
