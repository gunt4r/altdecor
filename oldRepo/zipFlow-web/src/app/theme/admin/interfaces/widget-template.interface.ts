import {anyObj} from "./shared.types.interface";
import {MetaInterface} from "./meta.interface";


export interface WidgetTemplateInterface {
  id?: number
  type: WidgetType
  name: string
  description: string
  config: anyObj
  active?: boolean
}

export interface TemplateListResponse {
  data: WidgetTemplateInterface[]
  meta: MetaInterface
}

export enum WidgetType {
  COMPARISON = 'COMPARISON',
  POLL = 'POLL'
}

export const DefaultTemplate = {
  name       : '',
  description: '',
  active     : false
}
