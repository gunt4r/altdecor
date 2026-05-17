import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import * as translate from "../../../../../../assets/translate/translate.json"
import {ActivatedRoute, Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  data!: { [translateKey: string]: string };

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private route: ActivatedRoute) {
    this.init();
  }

  private init() {
    if (!isPlatformBrowser(this.platformId)) {
      this.translate(this.router.url.split('/')[1].split('?')[0] || 'ro');
    } else {
      if (localStorage.getItem('language'))
       this.translate(localStorage.getItem('language') || 'ro');
      else this.translate(this.router.url.split('/')[1].split('?')[0] || 'ro');
    }
  }

  translate(lang: string) {
    const previousLanguage = localStorage.getItem('language') || "ro";
    const language = lang.toLowerCase();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', language);
    }

    this.data = this.getJsonData(language);

    if (isPlatformBrowser(this.platformId)) {
      if (lang !== previousLanguage) {
        const queryParams = this.route.snapshot.queryParams;
        const fragment = this.router.url.split('#')[1];
        const url = this.router.url.split('?')[0].split('#')[0];
        if (url === `/${previousLanguage}`) {
          this.router.navigate([url.replace(`/${previousLanguage}`, `/${language}`)], { queryParams, fragment })
        } else {
          this.router.navigate([url.replace(`/${previousLanguage}/`, `/${language}/`)], { queryParams, fragment })
        }
      }
    }
  }

  private getJsonData(lang: string) {
    return (translate as any)[lang] || {};
  }
}
