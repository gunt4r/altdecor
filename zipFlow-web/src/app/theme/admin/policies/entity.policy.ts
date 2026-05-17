'use strict';

import {ViewPermissionsMixin} from './mixins/view.permissions.mixin';
import {ChangePermissionsMixins} from './mixins/change.permission.mixin';
import BasePolicy from "./base.policy";
import {Entities} from "../dictionary/permissions.dictionary";

export default class EntityPolicy extends ViewPermissionsMixin(ChangePermissionsMixins(BasePolicy)) {
  protected override entity: string = Entities.ENTITY;
}
