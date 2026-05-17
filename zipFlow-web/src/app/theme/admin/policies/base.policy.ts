import _ from 'lodash';
import {anyObj} from "../interfaces/shared.types.interface";

export default class BasePolicy {
  protected entity: string = '';

  protected permissions(user: anyObj, path?: string) {
    const permissions = user['permissions'] ? user['permissions'][this.entity] : null;
    if (!permissions) {
      return null;
    }

    return path ? this.get(permissions, path) : permissions;
  }

  protected hasPermission(name: string, user: anyObj, resource: anyObj): boolean {
    const permission = this.permissions(user, name);
    if (!permission) {
      return false;
    }

    return this.isBool(permission) || permission.all || (permission.own && this.isOwner(user, resource));
  }

  protected isOwner(_user: anyObj, _resource: anyObj): boolean {
    return false;
  }

  protected get(value: anyObj, path: string, defaultValue: any = false): any {
    return _.get(value, path, defaultValue);
  }

  protected isBool(value: any): boolean {
    return _.isBoolean(value) && (value === true);
  }
}
