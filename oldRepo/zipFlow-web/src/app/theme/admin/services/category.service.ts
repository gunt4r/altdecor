import {Injectable} from '@angular/core';
import {CrudService} from './crud.service';
import {Store} from '@ngrx/store';
import {CategoryInterface, CategoryListResponse} from "../interfaces/category.interface";
import {setCategories} from "../store/actions/collections.actions";
import {CategoryRepository} from "../repositories/category.repository";
import {getStoreValue} from "../helpers/main.utils";
import {selectCategories} from "../store/selectors/collections.selectors";

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends CrudService<CategoryInterface, CategoryListResponse> {
  constructor(private store: Store, protected override repository: CategoryRepository) {
    super(repository);
  }

  override async getList(qp?: any) {
    let {categories} = await getStoreValue(this.store, selectCategories);
    if (!categories.length) {
      categories = await this.repository.getList(qp);
      this.store.dispatch(setCategories({categories}));
    }

    return categories;
  }
}
