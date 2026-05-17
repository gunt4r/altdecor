import {MetaInterface} from "./meta.interface";

export interface EntityInterface {
  id?: string
  categoryId: string
  name: string
  description: string
  active?: boolean
}

export interface EntityListResponse {
  data: EntityInterface[]
  meta: MetaInterface
}

export interface EntityCrudListResponse {
  id?: string
  label: string
  slug: string
}
