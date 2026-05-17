import {Component, EventEmitter, Inject, Input, Output, PLATFORM_ID} from '@angular/core';
import {SelectOption, SelectType} from "../../../../shared/components/select/select.type";
import {ProductsSort} from "./products-sort.enum";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-products-header',
  templateUrl: './products-header.component.html',
  styleUrl: './products-header.component.scss'
})
export class ProductsHeaderComponent {
  @Input() total: number = 0;
  @Output() onSort = new EventEmitter<ProductsSort>;

  sorts: SelectOption<ProductsSort>[] = [
    {
      value: ProductsSort.Last,
      label: 'Products.SortCategories.Last'
    },
    {
      value: ProductsSort.Expensive2Cheap,
      label: 'Products.SortCategories.Expensive2Cheap'
    },
    {
      value: ProductsSort.Cheap2Expensive,
      label: 'Products.SortCategories.Cheap2Expensive'
    }
  ]

  sortBy = this.sorts[0].label;

  selectType = SelectType;

  subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  sort(event: any) {
    this.onSort.emit(event);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.subscriptions.push(this.route.queryParams.subscribe((p: any) => {
        if (p.sortBy) {
          this.sortBy = this.sorts.find((el: any) => el.value === p.sortBy)?.label || this.sorts[0].label;
        }
      }));
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }
}
