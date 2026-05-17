import {Injectable} from '@angular/core';
import {CategoryInterface, CategoryListResponse} from "../interfaces/category.interface";
import {CrudRepository} from "./crud.repository";
import {HttpGateway} from "../helpers/http.gateway";

@Injectable({
  providedIn: 'root'
})
export class CategoryRepository extends CrudRepository<CategoryInterface, CategoryListResponse> {
  constructor(protected override gateway: HttpGateway) {
    super(gateway, 'categories');
  }
}
