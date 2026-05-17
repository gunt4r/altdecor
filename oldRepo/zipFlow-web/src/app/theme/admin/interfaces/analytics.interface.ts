import {MetaInterface} from "./meta.interface";

export enum AnalyticsType {
  GoogleAnalytics = 'google_analytics',
  FacebookPixel = 'facebook_pixel'
}
export interface AnalyticsInterface {
  id?: string,
  title?: string,
  type: AnalyticsType
  active: boolean,
  token: string
}

export interface AnalyticsListResponse {
  data: AnalyticsInterface[]
  meta: MetaInterface
}
