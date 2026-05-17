import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import {PublicService} from "../../services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-main-products-section',
  templateUrl: './main-products-section.component.html',
  styleUrl: './main-products-section.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MainProductsSectionComponent implements OnInit {
  categories: any[] = [];

  constructor(private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              @Inject(PLATFORM_ID) private platformId: Object,
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.publicService.getCategoriesBanner().subscribe((response: any) => {
        if (response && response.data) {
          this.categories = response.data.map((item: any) => {
            return {
              title: findObjectByKey(item.data, 'title'),
              link: findObjectByKey(item.data, 'link'),
              bg_img: findObjectByKey(item.data, 'bg_img')?.[0]?.['file_url'],
            }
          })
        }
        this.cdr.detectChanges();
      })
    }
  }

  navigateToLink(link: string) {
    if (!link) return;
    try {
      const url = new URL(link);
      this.router.navigateByUrl(url.pathname + url.search);
    } catch {
      this.router.navigateByUrl(link);
    }
  }
}
