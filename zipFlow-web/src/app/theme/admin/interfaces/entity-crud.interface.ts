import {MetaInterface} from "./meta.interface";

export interface EntityCrudInterface {
  id?: number
  entity_id?: number
  data: any
}

export interface EntityCrudListResponse {
  data: EntityCrudInterface[]
  meta: MetaInterface
}
