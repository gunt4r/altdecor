import {Component, ElementRef, EventEmitter, HostListener, Inject, Input, Output, PLATFORM_ID} from '@angular/core';
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
  @Output() openFilter = new EventEmitter<void>();

  isMobile = false;
  isSortMenuOpen = false;

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
              private elementRef: ElementRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  @HostListener('window:resize')
  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 1024;
      if (!this.isMobile) {
        this.isSortMenuOpen = false;
      }
    }
  }

  // Close the mobile sort menu when clicking outside of the toolbar.
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (this.isSortMenuOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isSortMenuOpen = false;
    }
  }

  sort(event: any) {
    this.onSort.emit(event);
  }

  get activeSortValue(): ProductsSort {
    return this.sorts.find(s => s.label === this.sortBy)?.value ?? this.sorts[0].value;
  }

  toggleSortMenu(): void {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }

  selectSort(option: SelectOption<ProductsSort>): void {
    this.sortBy = option.label;
    this.isSortMenuOpen = false;
    this.onSort.emit(option.value);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
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
