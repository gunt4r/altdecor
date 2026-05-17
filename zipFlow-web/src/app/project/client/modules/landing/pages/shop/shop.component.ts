import {ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {ShopCategory} from "./shop.dictionary";
import {PublicService} from "../../../shared/services/public.service";
import {forkJoin, tap} from "rxjs";
import {Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})

export class ShopComponent implements OnInit {
  @Output() onClose: EventEmitter<boolean> = new EventEmitter();

  shopCategories: ShopCategory[] = [];
  popular: { image: string, link: string }[] = [];

  language = localStorage.getItem('language') || 'ro';

  constructor(private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // this.getData();
    }
  }

  getData() {
    forkJoin([this.publicService.getProductTypes(), this.publicService.getProductCategories()]).pipe(
      tap(([types, categories]) => {
        this.shopCategories = (types.data.filter((type: any) => this.findObjectByKey(type.data, 'main'))).map((type: any) => ({
          category: this.findObjectByKey(type.data, 'label'),
          products: (categories.data.filter((category: any) => this.findObjectByKey(category.data, 'main') && !this.findObjectByKey(category.data, 'most_popular')))
            .filter((category: any) => this.findObjectByKey(type.data, 'categories')?.find((categoryEl: any) => categoryEl['value']['id'] === category.id))
            ?.map((category: any) => ({
              image: this.findObjectByKey(category.data, 'image')[0]['file_url'],
              label: this.findObjectByKey(category.data, 'label'),
              link: `sortBy=created_at&sortOrder=DESC&page=1&rowsPerPage=12&filter=product_category_contains_${this.findObjectByKey(category.data, 'label')[this.language]}`
            }))?.slice(0, 7)
        })).filter((el: any) => el.products?.length);

        this.popular = (categories.data.filter((category: any) => this.findObjectByKey(category.data, 'most_popular'))).map((category: any) => ({
          image: this.findObjectByKey(category.data, 'image')[0]['file_url'],
          label: this.findObjectByKey(category.data, 'label'),
          link: `sortBy=created_at&sortOrder=DESC&page=1&rowsPerPage=12&filter=product_category_contains_${this.findObjectByKey(category.data, 'label')[this.language]}`
        }))?.slice(0, 2);

        this.cdr.detectChanges();
      })
    ).subscribe();
  }

  findObjectByKey(array: any[], key: string) {
    return array.find(el => Object.keys(el).find(elKey => elKey === key))?.[key];
  }

  navigate(queryParamsString: string) {
    if (queryParamsString) {
      const queryParams: any = {};

      queryParamsString.split('&').forEach(part => {
        const item = part.split('=');
        queryParams[item[0]] = item[1];
      });

      this.router.navigate(['/products'], {queryParams});

      this.onClose.emit();
    }
  }
}
