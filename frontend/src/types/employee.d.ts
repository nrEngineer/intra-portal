export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}
