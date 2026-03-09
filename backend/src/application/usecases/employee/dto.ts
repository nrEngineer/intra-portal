export interface RegisterEmployeeInputDTO {
  userId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  photoUrl?: string;
  phone?: string;
  joinedAt: string;
}

export interface UpdateEmployeeInputDTO {
  name: string;
  email: string;
  department: string;
  position: string;
  photoUrl?: string;
  phone?: string;
  joinedAt: string;
}
