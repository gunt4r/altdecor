import _ from 'lodash';
import {createReducer, on} from '@ngrx/store';
import * as actions from '../actions/user.actions';
import {anyObj} from "../../interfaces/shared.types.interface";
import {UserInterface} from "../../interfaces/user.repository.interface";

export interface State {
  isReady: boolean,
  headers: Headers | null;
  user: UserInterface | null;
  rolesIds: number[] | null;
  permissions: anyObj | null;
}

export const initialState: State = {
  isReady    : false,
  headers    : null,
  user       : null,
  rolesIds   : null,
  permissions: null
};

const setProfileReducerCb = (state: State, {user}: anyObj) => {
  const userData = user ? _.pick(user, [
    'id',
    'name',
    'email'
  ]) : null;

  return {
    ...state,
    user: userData
  };
};
const setRolesIdsReducerCb = (state: State, {rolesIds}: anyObj) => ({...state, rolesIds});
const setPermissionsReducerCb = (state: State, {permissions}: anyObj) => ({...state, permissions});
const setHeadersReducerCb = (state: State, {headers}: anyObj) => ({...state, headers});
const setReadyReducerCb = (state: State, {isReady}: anyObj) => ({...state, isReady});
const setAllReducerCb = (state: State, {user}: anyObj) => {
  const stateWithUser = setProfileReducerCb(state, {user});
  const {rolesIds, permissions} = user ? user : {rolesIds: null, permissions: null};
  return {
    ...stateWithUser,
    rolesIds,
    permissions
  };
};

export const reducer = createReducer(
  initialState,
  on(actions.setProfile, setProfileReducerCb),
  on(actions.setRolesIds, setRolesIdsReducerCb),
  on(actions.setPermissions, setPermissionsReducerCb),
  on(actions.setAll, setAllReducerCb),
  on(actions.setHeaders, setHeadersReducerCb),
  on(actions.setReady, setReadyReducerCb)
);
