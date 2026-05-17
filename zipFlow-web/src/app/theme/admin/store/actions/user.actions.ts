import {createAction, props} from '@ngrx/store';
import {UserInterface} from "../../interfaces/user.repository.interface";
import {anyObj} from "../../interfaces/shared.types.interface";

export const setReady = createAction(
  '[AUTH] Set Ready - boolean',
  props<{ isReady: boolean }>()
);

export const setHeaders = createAction(
  '[AUTH] Set Headers - x-token',
  props<{ headers: Headers | null }>()
);

export const setProfile = createAction(
  '[AUTH] Set Profile',
  props<{ user: UserInterface | null }>()
);

export const setRolesIds = createAction(
  '[AUTH] Set Roles Ids',
  props<{ rolesIds: number[] }>()
);

export const setPermissions = createAction(
  '[AUTH] Set Permissions',
  props<{ permissions: anyObj }>()
);

export const setAll = createAction(
  '[AUTH] Set User, Roles and Permissions',
  props<{ user: UserInterface | null }>()
);
