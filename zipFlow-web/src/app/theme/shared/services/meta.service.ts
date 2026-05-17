import {Injectable} from '@angular/core';
import {Meta, Title} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  constructor(private meta: Meta, private title: Title) {
  }

  public updateMeta(title: string, description: string, image_url: string, url: string) {
    this.title.setTitle(title.toString());
    this.meta.updateTag({name: 'title', content: title})
    this.meta.updateTag({name: 'description', content: description})
    this.meta.updateTag({property: 'og:type', content: 'website'})
    this.meta.updateTag({property: 'og:url', content: url})
    this.meta.updateTag({property: 'og:title', content: title})
    this.meta.updateTag({property: 'og:description', content: description})
    this.meta.updateTag({
      property: 'og:image',
      content: image_url
    })
    this.meta.updateTag({property: 'twitter:card', content: 'summary_large_image'})
    this.meta.updateTag({property: 'twitter:url', content: url})
    this.meta.updateTag({property: 'twitter:title', content: title})
    this.meta.updateTag({property: 'twitter:description', content: description})
    this.meta.updateTag({
      property: 'twitter:image',
      content: image_url
    })
  }

}
