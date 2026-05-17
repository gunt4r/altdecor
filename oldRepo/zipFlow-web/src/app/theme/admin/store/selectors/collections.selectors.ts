import {createFeatureSelector, createSelector} from '@ngrx/store';
import {State as AuthState} from '../reducers/collections.reducer';

export const collectionsStateKey = 'collections';

const selectCollectionsState = createFeatureSelector<AuthState>(collectionsStateKey);

const getCategories = (state: AuthState) => ({
  categories: state.categories
});

export const selectCategories = createSelector(
  selectCollectionsState,
  getCategories
);
