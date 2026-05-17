import {MetaInterface} from "./meta.interface";

export interface DataTypesInterface {
  key: string;
  value: string;
}

export interface CategoryInterface {
  id: string;
  name: string;
}

export interface CategoryListResponse {
  data: CategoryInterface[]
  meta: MetaInterface
}
