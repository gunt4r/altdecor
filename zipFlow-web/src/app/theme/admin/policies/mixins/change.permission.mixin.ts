import {MixinConstructor} from "../../helpers/main.utils";
import BasePolicy from "../base.policy";
import {anyObj} from "../../interfaces/shared.types.interface";
import {PolicyActions} from "../../dictionary/permissions.dictionary";


export const ChangePermissionsMixins = <T extends MixinConstructor<BasePolicy>>(superclass: T) =>
  class extends superclass {
    public create(user: anyObj): boolean {
      return this.permissions(user)?.create;
    }

    public update(user: anyObj, resource: anyObj): boolean {
      return this.canUpdateResource(user, resource);
    }

    public destroy(user: anyObj, resource: anyObj): boolean {
      return this.canDestroyResource(user, resource);
    }

    protected canUpdateResource(user: anyObj, resource: anyObj): boolean {
      return this.hasPermission(PolicyActions.UPDATE, user, resource);
    }

    protected canDestroyResource(user: anyObj, resource: anyObj): boolean {
      return this.hasPermission(PolicyActions.DESTROY, user, resource);
    }
  };
