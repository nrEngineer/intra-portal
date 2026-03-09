import type { Employee } from "../../../domain/models/employee.js";

export interface EmployeeRepository {
  findAll(search?: string, department?: string): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  create(data: Employee): Promise<Employee>;
  update(id: string, data: Omit<Employee, "id" | "userId" | "createdAt">): Promise<Employee | null>;
  delete(id: string): Promise<boolean>;
}
