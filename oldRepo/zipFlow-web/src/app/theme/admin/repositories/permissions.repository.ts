import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {
  AllPermissionsInterface, PermissionsRepositoryInterface,
  RolePermissionsInterface,
  UserPermissionsInterface
} from "../interfaces/permissions.repository.interface";

@Injectable({
  providedIn: 'root'
})

export class PermissionsRepository implements PermissionsRepositoryInterface {
  constructor(private http: HttpClient) { }

  public getRoles(): Promise<RolePermissionsInterface[]> {
    return lastValueFrom(this.http.get('roles')) as Promise<RolePermissionsInterface[]>;
  }

  public getAllPermissions(): Promise<AllPermissionsInterface[]> {
    return lastValueFrom(this.http.get('permissions')) as Promise<AllPermissionsInterface[]>;
  }

  public getRolePermissions(id: number): Promise<RolePermissionsInterface[]> {
    return lastValueFrom(this.http.get(`roles/${encodeURIComponent(id)}/permissions`)) as Promise<RolePermissionsInterface[]>;
  }

  public getUserPermissions(id: number): Promise<UserPermissionsInterface> {
    return lastValueFrom(this.http.get(`users/${encodeURIComponent(id)}/permissions`));
  }

  public updateRolePermissions(id: number, permissions: number[]): Promise<any> {
    return lastValueFrom(this.http.post(`roles/${encodeURIComponent(id)}/permissions`, {permissions}));
  }

  public updateUserPermissions(id: number, permissions: number[]): Promise<any> {
    return lastValueFrom(this.http.post(`users/${encodeURIComponent(id)}/permissions`, {permissions}));
  }
}
