import {anyObj} from "./shared.types.interface";

export interface UserInterface {
  id: string;
  email: string;
  name: string;
}

export interface ProfileInterface extends UserInterface {
  roles: number[];
  permissions: anyObj;
}

export interface Headers {
  // 'x-token': string;
}

export interface UserRepositoryInterface {
  getProfile(): Promise<ProfileInterface>;
}
