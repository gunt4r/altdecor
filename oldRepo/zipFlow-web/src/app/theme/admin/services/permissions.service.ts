import {Injectable} from '@angular/core';
import EntityPolicy from "../policies/entity.policy";
import {RolePermissionsInterface} from "../interfaces/permissions.repository.interface";
import {PermissionsRepository} from "../repositories/permissions.repository";
import {anyObj} from "../interfaces/shared.types.interface";
import UserPolicy from "../policies/user.policy";
import {Entities} from "../dictionary/permissions.dictionary";

@Injectable({
  providedIn: 'root'
})

export class PermissionsService {
  policies: anyObj = {};

  constructor(protected repository: PermissionsRepository) {}

  public getRoles() {
    return this.repository.getRoles();
  }

  public getPermissions() {
    return this.repository.getAllPermissions();
  }

  public getRolePermissions(id: number): Promise<RolePermissionsInterface[]> {
    return this.repository.getRolePermissions(id);
  }

  public updateRolePermissions(id: number, permissions: number[]): Promise<any> {
    return this.repository.updateRolePermissions(id, permissions);
  }

  public can(user: anyObj, entity: Entities | undefined, action: string | undefined, resource: any = null): boolean {
    const policy = this.getPolicy(entity);
    // @ts-ignore
    if (!policy || !policy[action]) {
      return false;
    }

    if (!user['id'] || !user['rolesIds'] || !user['permissions']) {
      return false;
    }

    // @ts-ignore
    return policy[action](user, resource);
  }

  private getPolicy(entity: Entities | undefined): any {
    const entityMapper: any = {
      [Entities.ENTITY]          : EntityPolicy,
      [Entities.USER]           : UserPolicy
    };

    // @ts-ignore
    if (!entityMapper[entity]) {
      return null;
    }

    // @ts-ignore
    if (!this.policies[entity]) {
      // @ts-ignore
      this.policies[entity] = new entityMapper[entity]();
    }

    // @ts-ignore
    return this.policies[entity];
  }
}
