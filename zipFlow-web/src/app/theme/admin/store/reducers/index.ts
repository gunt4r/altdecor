import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import * as userReducer from './user.reducer';
import * as collectionsReducer from './collections.reducer';

export interface State {
  user: userReducer.State,
  collections: collectionsReducer.State
}

export const reducers: ActionReducerMap<State> = {
  user       : userReducer.reducer,
  collections: collectionsReducer.reducer
};

export const metaReducers: MetaReducer<State>[] = [];
