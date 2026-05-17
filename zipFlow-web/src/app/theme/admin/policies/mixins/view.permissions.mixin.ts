import {anyObj} from "../../interfaces/shared.types.interface";
import {PolicyActions} from "../../dictionary/permissions.dictionary";
import {MixinConstructor} from "../../helpers/main.utils";
import BasePolicy from "../base.policy";

export const ViewPermissionsMixin = <T extends MixinConstructor<BasePolicy>>(superclass: T) =>
  class extends superclass {
    public viewList(user: anyObj) {
      const permissions = this.permissions(user, PolicyActions.VIEW);

      return this.isBool(permissions) || this.get(permissions, 'all') || this.get(permissions, 'own');
    }

    public view(user: anyObj, resource: anyObj) {
      return this.canViewResource(user, resource);
    }

    protected canViewResource(user: anyObj, resource: anyObj) {
      return this.hasPermission(PolicyActions.VIEW, user, resource);
    }
  };
