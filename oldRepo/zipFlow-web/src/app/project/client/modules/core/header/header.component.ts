import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID
} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {PageSlug} from "../../shared/components/page-container/pages.type";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "../../shared/services/translate.service";
import {PublicService} from "../../shared/services/public.service";
import {CartProductService} from "../../shared/services/cart-products.service";
import {debounceTime, forkJoin, tap} from "rxjs";
import {QueryParamsService} from "../../../../../theme/shared/services/query-params.service";
import {SortTypes} from "../../../../../theme/client/utils/api-params.utils";
import {findObjectByKey} from "../../../../../theme/shared/utils/form.utils";
import {ToastrService} from "ngx-toastr";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export interface Data {
  MENU: {
    [key: string]: {
      LABEL: string,
      LINK?: string,
      MODAL?: boolean,
      FRAGMENT?: string
    }
  };
  QUICK_MENU: {
    [key: string]: string;
  };
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @Output() active: EventEmitter<boolean> = new EventEmitter(false);
  @Input() activeDialog: boolean = false;
  generalDetails: any = {};
  menuOpened = false;
  productsMenuData: any = [];
  activeCategoryId: any;
  showProducts: any = [];
  data: Data = {
    "MENU": {
      // "SHOP": {
      //   "LABEL": "Header.Menu.Shop",
      //   "MODAL": true
      // },
      // "SMART_TECH": {
      //   "LABEL": "Header.Menu.SmartTech",
      //   "LINK": PageSlug.Products
      // },
      // "PORTFOLIO": {
      //   "LABEL": "Header.Menu.Portfolio",
      //   "LINK": PageSlug.Portfolio
      // },
      // "BLOG": {
      //   "LABEL": "Header.Menu.Blog",
      //   "LINK": PageSlug.Blog
      // },
      // "ABOUT_US": {
      //   "LABEL": "Header.Menu.About",
      //   "LINK": PageSlug.AboutUs
      // },
      // "FAQ": {
      //   "LABEL": "Header.Menu.FAQ",
      //   "LINK": PageSlug.Faq
      // },
      "CONTACTS": {
        "LABEL": "Header.Menu.Contacts",
        "LINK": PageSlug.Contacts
      },
      "CHECKOUT": {
        "LABEL": "Header.Menu.Checkout",
        "LINK": PageSlug.Checkout
      }
    },
    "QUICK_MENU": {
      "CATALOG": "Header.QuickMenu.Catalog",
      // "ABOUT": "Header.QuickMenu.About"
    }
  };
  menuKeys: string[] = [];
  selectedLanguage = localStorage.getItem('language')?.toUpperCase() || 'RO';
  isCartOpen: boolean = false;
  isSideMenuOpen: boolean = false;
  isMobile: boolean = false;
  sizeChecked: boolean = false;
  languages: string[] = [];
  cartCount = 0;
  searchParam = "search";
  searchTerm!: string;
  pdfKeyPrefix = 'storedPdf_';
  contactPhone: any = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private route: ActivatedRoute,
              private router: Router,
              private translateService: TranslateService,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              private cartService: CartProductService,
              private qpService: QueryParamsService,
              private toastr: ToastrService,
              private destroy: DestroyRef
  ) {
    this.searchTerm = this.qpService.getParamValue(this.searchParam) || "";
  }

  @HostListener('window:resize', ['$event'])
  checkScreenSize(event?: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 769;
      this.sizeChecked = true;
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getMenuKeys();
      this.checkScreenSize();
      this.publicService.getLanguages().pipe(takeUntilDestroyed(this.destroy)).subscribe((languages: any) => {
        this.languages = languages.data?.map((el: any) => el.key.toUpperCase());
        this.cdr.detectChanges();
      });

      this.publicService.getGeneralDetails().pipe(takeUntilDestroyed(this.destroy)).subscribe((response: any) => {
        if (response && response.data) {
          this.generalDetails = {
            main_phone: findObjectByKey(response.data?.[0]?.data, 'main_phone'),
            catalog: findObjectByKey(response.data?.[0]?.data, 'catalog'),
          };
        }
      })

      this.cartService.cartCountValue.pipe(
        debounceTime(100),
        tap((value: number) => {
          this.cartCount = value;
          this.cdr.detectChanges();
        }),
        takeUntilDestroyed(this.destroy)
      ).subscribe();

      this.route.queryParams.pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe((params: any) => {
        if (params.search) {
          this.searchTerm = params.search;
        }
      });
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getProductsData();
    }
  }

  getProductsData() {
    this.productsMenuData = [];

    const params = {
      page: 1,
      rowsPerPage: 1000
    };

    forkJoin([this.publicService.getProductsFilterLabels(), this.publicService.getProductTypes(params)]).pipe(
      tap(([labels, types]) => {
        const labelTypes = labels.filter((el: any) => el['product_type']);
        const labelCategories = labels.filter((el: any) => el['product_category']);

        const filteredTypes = types?.data.filter((el: any) =>
          findObjectByKey(el.data, 'show_in_filters') &&
          labelTypes.some((labelType: any) =>
            labelType['product_type']?.some((pt: any) => pt['value']?.['id'] === el.id)
          )
        ).map((el: any) => {
          const allCategories = findObjectByKey(el.data, 'categories');
          const filteredCategories = allCategories.filter((category: any) =>
            labelCategories.some((labelCategory: any) =>
              labelCategory['product_category']?.some((pc: any) => pc['value']?.['id'] === category['value']['id'])
            )
          );

          const combinedCategories = Array.from(
            new Set([...allCategories, ...filteredCategories])
          );

          return {
            id: el.id,
            label: findObjectByKey(el.data, 'label'),
            categories: combinedCategories
          };
        });

        filteredTypes?.forEach(({id, label, categories}: any) => {
          this.productsMenuData.push({
            type: {
              label,
              id,
              active: false
            },
            categories: categories?.map(({value: {id, label}}: any) => ({
              label,
              id,
              url: `/products`,
              products: []
            })) || []
          });
        });

        this.cdr.detectChanges();

        this.productsMenuData.forEach((el: any, typeIndex: number) => {
          forkJoin(el.categories.map((category: any) => this.publicService.getProducts({
            page: 1,
            rowsPerPage: 1000,
            filter: 'product_category_contains_' + category.label[Object.keys(category.label)[0]],
            sortBy: 'created_at',
            sortOrder: 'DESC'
          }))).pipe(
            tap((data: any) => {
              data.forEach((productData: any, index: number) => {
                this.productsMenuData[typeIndex].categories[index].products = productData?.data?.map((product: any) => ({
                  image: findObjectByKey(product.data, 'images')?.[0]?.['file_url'],
                  title: findObjectByKey(product.data, 'title'),
                  id: product.id,
                  url: `/products/${product.id}`
                })) || [];
              });

              this.cdr.detectChanges();
            }),
            takeUntilDestroyed(this.destroy)
          ).subscribe();
        });
      }),
      takeUntilDestroyed(this.destroy)
    ).subscribe();
  }

  downloadPdf(catalog: any[]) {
    this.publicService.downloadPdf(catalog[0].file_url).pipe(takeUntilDestroyed(this.destroy)).subscribe((data: any) => {
      const reader = new FileReader();

      reader.onload = () => {
        const pdfData = reader.result as string;
        this.downloadPdfFromStorage(pdfData);
        this.toastr.success('PDF downloaded successfully!');
      };
      reader.readAsDataURL(data);
    })
  }

  downloadPdfFromStorage(pdfData: string) {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = 'Catalog.pdf';
    link.click();
  }

  closeMenu(): void {
    this.isSideMenuOpen = !this.isSideMenuOpen;
  }

  switchLanguage(language: string) {
    this.selectedLanguage = language;
    this.translateService.translate(language);
  }

  getMenuKeys(): void {
    this.menuKeys = Object.keys(this.data?.MENU);
  }

  toggleOpenCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  toggleOpenSideMenu(): void {
    this.isSideMenuOpen = !this.isSideMenuOpen;
  }

  changeActive(active?: boolean) {
    this.activeDialog = active !== undefined ? active : !this.activeDialog;
    this.active.emit(this.activeDialog);
    this.toggleOpenSideMenu();
  }

  search() {
    this.updateSearchParam();
    this.router.navigate(['/products'], {
      queryParams: {
        search: this.searchTerm || null,
        page: 1,
        rowsPerPage: 12,
        sortBy: 'created_at',
        sortOder: SortTypes.DESC
      }
    });
  }

  updateSearchParam() {
    if (this.qpService.getParamValue(this.searchParam) !== this.searchTerm) this.qpService.updateParam(this.searchParam, this.searchTerm);
  }

  setActiveType(id: any) {
    this.productsMenuData.forEach((el: any) => {
      el.type.active = el.type.id == id;
    })
  }

  setActiveCategory(id: any, products: any) {
    this.activeCategoryId = id;
    this.showProducts = products;
  }

  toggleMenuOpened(value: boolean, avoidToggle?: boolean) {
    if (!avoidToggle) {
      this.menuOpened = value;

      if (this.menuOpened) {
        document.documentElement.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "auto";
      }
    }
  }

  goToCategory(url: string, active: boolean, label: any) {
    if (active) {
      const language = localStorage.getItem('language') || 'ro';

      this.router.navigate([`/${language}${url}`], {
        queryParams: {
          sortBy: 'created_at',
          sortOrder: 'DESC',
          page: 1,
          rowsPerPage: 12,
          filter: `product_category_contains_${label['ro']}`
        }
      });

      this.toggleMenuOpened(false);
    }
  }

  goToProduct(url: string) {
    const language = localStorage.getItem('language') || 'ro';

    this.router.navigate([`/${language}${url}`]);

    this.toggleMenuOpened(false);
  }
}
