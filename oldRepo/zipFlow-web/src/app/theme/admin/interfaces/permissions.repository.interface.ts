export interface AllPermissionsInterface {
  id: number
  name: string
  description: string
}

export interface RolePermissionsInterface {
  id: number
  name: string
}

export interface UserPermissionsInterface {}

export interface PermissionsRepositoryInterface {
  getAllPermissions(): Promise<AllPermissionsInterface[]>;

  getRolePermissions(id: number): Promise<RolePermissionsInterface[]>;

  getUserPermissions(id: number): Promise<UserPermissionsInterface>;

  updateRolePermissions(id: number, permissions: number[]): Promise<any>;

  updateUserPermissions(id: number, permissions: number[]): Promise<any>;
}
