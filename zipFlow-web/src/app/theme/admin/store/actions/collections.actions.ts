import {createAction, props} from '@ngrx/store';
import {CategoryInterface} from "../../interfaces/category.interface";

export const setCategories = createAction(
  '[COLLECTIONS] Set Categories',
  props<{ categories: CategoryInterface[] }>()
);
