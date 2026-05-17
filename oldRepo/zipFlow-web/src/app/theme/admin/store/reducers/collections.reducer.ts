import {createReducer, on} from '@ngrx/store';
import * as actions from '../actions/collections.actions';
import {CategoryInterface} from "../../interfaces/category.interface";
import {anyObj} from "../../interfaces/shared.types.interface";

export interface State {
  categories: CategoryInterface[];
}

export const initialState: State = {
  categories: []
};

const setCategoriesReducerCb = (state: State, {categories}: anyObj) => ({...state, categories});


export const reducer = createReducer(
  initialState,
  on(actions.setCategories, setCategoriesReducerCb)
);
