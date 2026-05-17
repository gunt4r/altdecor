import {MetaInterface} from "./meta.interface";

export interface LanguageInterface {
  id?: string
  label: string
  key: string
}

export interface LanguageListResponse {
  data: LanguageInterface[]
  meta: MetaInterface
}
