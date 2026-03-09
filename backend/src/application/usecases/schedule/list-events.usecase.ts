import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ForbiddenError, TeamIdRequiredError } from "../../../domain/errors/domain-error.js";
import type { User } from "../../../domain/models/user.js";

export class ListEventsUseCase {
  async execute(
    uow: UnitOfWork,
    teamId: string | undefined,
    start: string | undefined,
    end: string | undefined,
    user: User,
  ) {
    if (!teamId) {
      throw new TeamIdRequiredError();
    }

    if (user.role !== "admin") {
      const isMember = await uow.scheduleRepo.isTeamMember(teamId, user.id);
      if (!isMember) {
        throw new ForbiddenError();
      }
    }

    const data = await uow.scheduleRepo.findEvents(teamId, start, end);
    return { data };
  }
}
