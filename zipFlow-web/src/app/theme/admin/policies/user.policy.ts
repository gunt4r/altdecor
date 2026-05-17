'use strict';

import {ViewPermissionsMixin} from './mixins/view.permissions.mixin';
import {ChangePermissionsMixins} from './mixins/change.permission.mixin';
import {anyObj} from "../interfaces/shared.types.interface";
import {Entities, PolicyActions} from "../dictionary/permissions.dictionary";
import BasePolicy from "./base.policy";

export default class UserPolicy extends ViewPermissionsMixin(ChangePermissionsMixins(BasePolicy)) {
  protected override entity: string = Entities.USER;

  updatePermissions(user: anyObj) {
    return this.permissions(user, PolicyActions.UPDATE_PERMISSIONS);
  }
}
