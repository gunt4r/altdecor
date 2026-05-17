import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Page, PageLabels, PageSlug} from "../../../shared/components/page-container/pages.type";
import {Router} from "@angular/router";
import {PublicService} from "../../../shared/services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {MetaService} from "../../../shared/services/meta.service";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit {
  pages: Page[] = [
    {
      link: PageSlug.Products,
      label: PageLabels[PageSlug.Shop]
    },
    {
      link: PageSlug.Portfolio,
      label: PageLabels[PageSlug.Portfolio]
    }
  ];
  data: any;

  loading = true;

  constructor(private meta: MetaService,
              private router: Router,
              private publicService: PublicService,
              @Inject(PLATFORM_ID) private platformId: Object,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.meta.getMeta(this.router.url)

    if (isPlatformBrowser(this.platformId)) {
      this.publicService.getPortfolio().subscribe((response: any) => {
        if (response && response.data) {
          const lastItem = response.data[response.data.length - 1];
          this.data = [{
            title: findObjectByKey(lastItem.data, 'title'),
            description: findObjectByKey(lastItem.data, 'description'),
          }];

          this.loading = false;

          this.cdr.detectChanges();
        }
      })
    }
  }

  buy() {
    this.router.navigate(['/products']);
  }
}
