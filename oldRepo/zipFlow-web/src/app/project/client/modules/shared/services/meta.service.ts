import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Meta, Title} from "@angular/platform-browser";
import {PageMetaInterface} from "../interfaces/meta.interface";
import {PublicService} from "./public.service";
import {getApiParams, LinkWord} from "../../../../../theme/client/utils/api-params.utils";
import {environment} from "../../../../../../environments/environment";
import {Router} from "@angular/router";
import {findObjectByKey} from "../../../../../theme/shared/utils/form.utils";
import {isPlatformBrowser} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  constructor(private meta: Meta,
              private title: Title,
              private publicService: PublicService,
              private router: Router,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  public updateMeta({title, description, url, image, copyright, keywords}: PageMetaInterface) {
    this.title.setTitle(title?.toString());
    this.meta.updateTag({name: 'title', content: title})
    this.meta.updateTag({name: 'description', content: description})
    this.meta.updateTag({name: 'keywords', content: keywords})
    this.meta.updateTag({name: 'copyright', content: copyright})
    this.meta.updateTag({property: 'og:type', content: 'website'})
    this.meta.updateTag({property: 'og:url', content: url})
    this.meta.updateTag({property: 'og:title', content: title})
    this.meta.updateTag({property: 'og:description', content: description})
    this.meta.updateTag({
      property: 'og:image',
      content: image
    })
    this.meta.updateTag({property: 'twitter:card', content: 'summary_large_image'})
    this.meta.updateTag({property: 'twitter:url', content: url})
    this.meta.updateTag({property: 'twitter:title', content: title})
    this.meta.updateTag({property: 'twitter:description', content: description})
    this.meta.updateTag({
      property: 'twitter:image',
      content: image
    })
  }

  public getMeta(url: any): void {
    const language = !isPlatformBrowser(this.platformId) ?
      (this.router.url.split('/')[1] || 'en') :
      (localStorage.getItem('language') || 'en');

    let filterParams: any = [
      {
        key: `site_url_path.${language}`,
        value: url.split('?')[0].split('#')[0],
        linkWord: LinkWord.EQUALS
      }
    ];

    const params = getApiParams(undefined, filterParams, undefined, 1, 1, false);
    this.publicService.getMeta(params).subscribe(({data}) => {
      const meta = findObjectByKey(data[0].data, 'meta');

      if (data[0] && meta)
        this.updateMetaData(meta, language, url);
    })
  }

  public updateMetaData(data: any, language: string, url: string) {
    if (data[0]) {
      const meta = data[0];

      const metaUpdated: PageMetaInterface = Object.keys(meta).reduce((result, key) => {
        return {
          ...result,
          [key]: key === 'image' && meta[key] ? meta[key]?.[0]?.file_url : meta[key]?.[language]
        };
      }, {}) as PageMetaInterface;

      this.updateMeta({
        ...metaUpdated,
        url: environment.appUrl + url.split('?')[0]
      })
    }
  }
}
