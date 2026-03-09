import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListLinksUseCase {
  async execute(uow: UnitOfWork, category: string | undefined) {
    return uow.linkRepo.findAll(category);
  }
}
