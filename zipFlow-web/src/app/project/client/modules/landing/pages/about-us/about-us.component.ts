import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {PublicService} from "../../../shared/services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {MetaService} from "../../../shared/services/meta.service";
import {Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent implements OnInit {
  aboutUs: any;

  loading = true;

  constructor(private publicService: PublicService,
              private meta: MetaService,
              private router: Router,
              @Inject(PLATFORM_ID) private platformId: Object,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.meta.getMeta(this.router.url)

    if(isPlatformBrowser(this.platformId)) {
      this.publicService.getAboutUs().subscribe((response: any) => {
        if (response && response.data) {
          const lastItem = response.data[response.data.length - 1];
          this.aboutUs = [{
            img: findObjectByKey(lastItem.data, 'img')?.[0]?.['file_url'],
            title: findObjectByKey(lastItem.data, 'title'),
            description: findObjectByKey(lastItem.data, 'description'),
          }];

          this.loading = false;

          this.cdr.detectChanges();
        }
      })
    }
  }
}
