import {WidgetTemplateInterface} from "./widget-template.interface";
import {CategoryInterface} from "./category.interface";
import {anyObj} from "./shared.types.interface";
import {MetaInterface} from "./meta.interface";

export interface WidgetInterface {
  id?: number;
  categoryId: number;
  templateId: number;
  name: string;
  slug: string;
  advertiser: string;
  privacyUrl: string;
  terms: string;
  category?: CategoryInterface;
  template?: WidgetTemplateInterface;
  active?: boolean;
  url: string;
  config?: anyObj;
}

export interface WidgetListResponse {
  data: WidgetInterface[];
  meta: MetaInterface;
}

export const DefaultWidget = {
  name      : '',
  slug      : '',
  advertiser: '',
  privacyUrl: '',
  terms     : `<p>By clicking on I Agree button below, agree that your details as set out above can be used by Nationwide News Pty Ltd and its related companies (“News Corp Australia”) to send you special offers and promotional materials.</br>You also agree that these details can be provided to iSelect for them to contact you directly to conduct a health insurance comparison from their range of <a href="https://www.iselect.com.au/popup-participating-health-funds/" title="https://www.iselect.com.au/popup-participating-health-funds/">Participating Funds</a> and policies, and to promote the range of other products they compare. You also agree that you have read and understand iSelect's <a href="https://www.iselect.com.au/popup-disclaimer/" title="https://www.iselect.com.au/popup-disclaimer/">Terms and Conditions</a> and <a href="https://www.iselect.com.au/privacy-collection-notice-health-insurance/" title="https://www.iselect.com.au/privacy-collection-notice-health-insurance/">Privacy Collection Notice</a> and to News Corp Australia's <a href="https://preferences.news.com.au/privacy/" title="https://preferences.news.com.au/privacy/">Privacy Policy</a>.</p>`,
  active    : false,
  url       : ''
};
