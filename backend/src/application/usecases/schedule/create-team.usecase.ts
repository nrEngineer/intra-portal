import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { CreateTeamInputDTO } from "./dto.js";

export class CreateTeamUseCase {
  async execute(uow: UnitOfWork, input: CreateTeamInputDTO) {
    const now = new Date().toISOString();
    const teamId = randomUUID();

    const team = await uow.scheduleRepo.createTeam({
      id: teamId,
      name: input.name,
      createdAt: now,
    });

    const members = input.memberIds.map((userId) => ({
      id: randomUUID(),
      teamId,
      userId,
    }));

    await uow.scheduleRepo.addTeamMembers(members);

    return { ...team, memberIds: input.memberIds };
  }
}
