export interface LoginInputDTO {
  email: string;
  password: string;
}

export interface LoginOutputDTO {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; role: string };
}

export interface RegisterInputDTO {
  email: string;
  name: string;
  password: string;
  role: string;
}

export interface UserOutputDTO {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordExecuteDTO {
  token: string;
  newPassword: string;
}
