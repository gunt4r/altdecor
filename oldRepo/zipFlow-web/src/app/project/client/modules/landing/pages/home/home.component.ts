import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {MetaService} from "../../../shared/services/meta.service";
import {Router} from "@angular/router";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {PublicService} from "../../../shared/services/public.service";
import {Measure, Vat} from "../../../shared/components/product/product.type";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: any = [];
  constructor(private meta: MetaService,
              private router: Router,
              private cdr: ChangeDetectorRef,
              private publicService: PublicService,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    this.meta.getMeta(this.router.url);
    // if(isPlatformBrowser(this.platformId)) {
      this.getData();
    // }
  }

  getData() {
    this.publicService.getProducts({filter: 'is_main_contains_true'}).subscribe(response => {
      if (response && response.data) {
        this.products = {
          content: response.data.map((productData: any) => {
            return {
              id: productData.id,
              characteristic: findObjectByKey(productData.data, 'characteristic')?.map((el: any) => {
                if (el?.property?.[0]) {
                  return {
                    key: el?.property?.[0]['key'],
                    value: el?.property?.[0]['value']
                  }
                }

                return null;
              }).filter((el: any) => el),
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
              isSale: findObjectByKey(productData.data, 'is_active'),
              tabs: findObjectByKey(productData.data, 'info')?.map((info: any) => info['description'][0])
            };
          }),
          total: response.meta.total
        };

        this.cdr.detectChanges();
      }
    });
  }
}
