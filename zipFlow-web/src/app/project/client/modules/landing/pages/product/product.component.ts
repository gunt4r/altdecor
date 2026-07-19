import {ChangeDetectorRef, Component, DestroyRef, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Page, PageLabels, PageSlug} from "../../../shared/components/page-container/pages.type";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Measure, Vat} from "../../../shared/components/product/product.type";
import {MetaService} from "../../../shared/services/meta.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {PublicService} from "../../../shared/services/public.service";
import {Subscription} from "rxjs";
import {filter} from "rxjs/operators";
import {isPlatformBrowser} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-product-page',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductPageComponent implements OnInit {
  productId: string | null = '';

  pages: Page[] = [
    {
      link: PageSlug.Products,
      label: PageLabels[PageSlug.Shop]
    },
    {
      link: PageSlug.Products,
      label: PageLabels[PageSlug.Products]
    }
  ];

  product: any;

  loading = true;

  subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute,
              private meta: MetaService,
              private router: Router,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    // this is a workaround for url matcher, fix in future releases
    this.getInitialData();

    // Navigating from one product to another (e.g. from the "Recommended" section)
    // reuses this component instance, so re-fetch whenever the product id in the URL
    // changes — otherwise the route changed but the content stayed the same.
    this.subscriptions.push(
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
        const parts = this.router.url.split('/');
        const newId = parts[parts.length - 1]?.split('?')[0];
        if (newId && newId !== this.productId) {
          this.getInitialData();
        }
      })
    );
  }

  getInitialData() {
    const urlParts = this.router.url.split('/');
    this.productId = urlParts[urlParts.length - 1]?.split('?')[0];

    // Tear the view down while the new product loads so the details subtree
    // (sizes, favourite state, etc.) is rebuilt for the new product.
    this.loading = true;
    this.pages = [];

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    this.getProductData();
  }

  getProductData() {
    this.publicService.getProductById(this.productId).subscribe((productData: any) => {
      if (productData && productData.data) {
        const language = !isPlatformBrowser(this.platformId) ?
          (this.router.url.split('/')[1] || 'en') :
          (localStorage.getItem('language') || 'en');

        const meta = findObjectByKey(productData.data, 'meta');

        if (meta)
          this.meta.updateMetaData(meta, language, this.router.url);

        this.pages.push(<Page>{
          link: PageSlug.Blog + '/' + this.productId,
          label: findObjectByKey(productData.data, 'title')
        });
        this.product =
          {
            id: productData.id,
            // Every characteristic (and every property inside it) configured in the
            // admin panel becomes a row in the Detalii produs table — nothing hardcoded.
            characteristic: (findObjectByKey(productData.data, 'characteristic') || [])
              .flatMap((el: any) => (el?.property || []).map((p: any) => ({
                key: p?.key,
                value: p?.value
              })))
              .filter((el: any) => el.key),
            labels: [findObjectByKey(productData.data, 'sku')],
            images: findObjectByKey(productData.data, 'images')?.map((el: any) => ({
              id: el.id,
              path: el.file_url
            })),
            title: findObjectByKey(productData.data, 'title'),
            price: {
              current: `${findObjectByKey(productData.data, 'configurations')?.[0]?.['configuration'][0]['price'][0]['value']} ${findObjectByKey(productData.data, 'configurations')?.[0]?.['configuration'][0]['price'][0]['currency']}`,
              old: `${findObjectByKey(productData.data, 'configurations')?.[0]?.['configuration'][0]['old_price'][0]['value']} ${findObjectByKey(productData.data, 'configurations')?.[0]?.['configuration'][0]['old_price'][0]['currency']}`,
            },
            vat: findObjectByKey(productData.data, 'vat_included') ? Vat.Include : Vat.NotInclude,
            model: findObjectByKey(productData.data, 'model'),
            material: findObjectByKey(productData.data, 'material')?.[0]?.['value']['label'],
            type: findObjectByKey(productData.data, 'product_type')?.[0]?.['value']['label'],
            sizes: findObjectByKey(productData.data, 'configurations').map((configuration: any) => ({
              height: configuration['configuration'][0].size?.replaceAll("mm", "")?.split('x')[0],
              width: configuration['configuration'][0].size?.replaceAll("mm", "")?.split('x')[1],
              length: configuration['configuration'][0].size?.replaceAll("mm", "")?.split('x')[2],
              price: {
                current: `${configuration['configuration'][0]['price'][0]['value']} ${configuration['configuration'][0]['price'][0]['currency']}`,
                old: `${configuration['configuration'][0]['old_price'][0]['value']} ${configuration['configuration'][0]['old_price'][0]['currency']}`,
              },
              stock: configuration['configuration'][0]['in_stock']
            })),
            measure: Measure.Mm,
            delivery: 'Product.FreeDelivery',
            stock: !!findObjectByKey(productData.data, 'configurations')?.[0]?.['configuration'][0]['in_stock'],
            isSale: findObjectByKey(productData.data, 'has_sale'),
            isNew: findObjectByKey(productData.data, 'is_new'),
            comingSoon: findObjectByKey(productData.data, 'coming_soon'),
            outOfStock: findObjectByKey(productData.data, 'out_of_stock'),
            fisa_tehnica: findObjectByKey(productData.data, 'fisa_tehnica')?.[0],
            tabs: findObjectByKey(productData.data, 'info')?.map((info: any) => info['description'][0])
          }

        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subs: Subscription) => subs.unsubscribe());
  }
}
