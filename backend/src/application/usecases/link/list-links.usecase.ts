import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListLinksUseCase {
  async execute(category: string | undefined, uow: UnitOfWork) {
    return uow.linkRepo.findAll(category);
  }
}
