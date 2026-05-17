import {createFeatureSelector, createSelector} from '@ngrx/store';
import {State as UserState} from '../reducers/user.reducer';

export const stateKey = 'user';

const selectUserState = createFeatureSelector<UserState>(stateKey);

const getProfile = (state: UserState) => ({
  id   : state.user?.id,
  email: state.user?.email,
  name : state.user?.name
});

const getHeaders = (state: UserState) => state.headers;

const getReady = (state: UserState) => state.isReady;

const getRolesIds = (state: UserState) => ({
  rolesIds: state.rolesIds
});

const getPermissions = (state: UserState) => ({
  permissions: state.permissions
});

export const selectReady = createSelector(
  selectUserState,
  getReady
);

export const selectHeaders = createSelector(
  selectUserState,
  getHeaders
);

export const selectProfile = createSelector(
  selectUserState,
  getProfile
);

export const selectRolesIds = createSelector(
  selectUserState,
  getRolesIds
);

export const selectPermissions = createSelector(
  selectUserState,
  getPermissions
);
