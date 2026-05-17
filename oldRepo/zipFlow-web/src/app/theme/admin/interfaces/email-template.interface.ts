import {MetaInterface} from "./meta.interface";

export interface EmailTemplateInterface {
  id?: string
  subject: string
  template: string
}

export interface EmailTemplateListResponse {
  data: EmailTemplateInterface[]
  meta: MetaInterface
}


export interface EmailSendInterface {
  slug: string;
  configs?: {[key: string]: string};
}
