import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListEmployeesUseCase {
  async execute(uow: UnitOfWork, search: string | undefined, department: string | undefined) {
    return uow.employeeRepo.findAll(search, department);
  }
}
