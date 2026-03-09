import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListCategoriesUseCase {
  async execute(uow: UnitOfWork) {
    return uow.linkRepo.getCategories();
  }
}
