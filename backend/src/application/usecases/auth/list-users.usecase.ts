import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { UserOutputDTO } from "./dto.js";

export class ListUsersUseCase {
  async execute(uow: UnitOfWork): Promise<UserOutputDTO[]> {
    return uow.userRepo.findAll();
  }
}
