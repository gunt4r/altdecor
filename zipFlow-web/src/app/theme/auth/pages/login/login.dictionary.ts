export interface LoginCredentials {
  password: string;
  email: string;
}

export interface LoginResponse {
  auth: boolean;
  token: string
}
