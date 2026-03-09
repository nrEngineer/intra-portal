import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListEmployeesUseCase {
  async execute(search: string | undefined, department: string | undefined, uow: UnitOfWork) {
    return uow.employeeRepo.findAll(search, department);
  }
}
