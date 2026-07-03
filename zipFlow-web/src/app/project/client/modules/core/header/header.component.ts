import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID
} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {PageSlug} from "../../shared/components/page-container/pages.type";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {TranslateService} from "../../shared/services/translate.service";
import {PublicService} from "../../shared/services/public.service";
import {CartProductService} from "../../shared/services/cart-products.service";
import {catchError, debounceTime, filter, forkJoin, of, tap} from "rxjs";
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

interface MenuProduct {
  image: string;
  title: string;
  id: string | number;
  url: string;
}

interface NavProductLink {
  label: string;
  filter: string;
}

interface TopNavLink {
  label: string;
  type: 'category' | 'route';
  path?: string;
  query?: any;
}

const FALLBACK_LANGUAGES = ['RO', 'RU', 'EN'];

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() active: EventEmitter<boolean> = new EventEmitter(false);
  @Input() activeDialog: boolean = false;
  generalDetails: any = {};
  menuOpened = false;
  productsMenuData: any = [];
  activeCategoryId: any;
  showProducts: MenuProduct[] = [];
  data: Data = {
    "MENU": {
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
    }
  };
  menuKeys: string[] = [];
  selectedLanguage = (localStorage.getItem('language') || 'ro').toUpperCase();
  isCartOpen: boolean = false;
  isSideMenuOpen: boolean = false;
  isMobile: boolean = false;
  sizeChecked: boolean = false;
  languages: string[] = [];
  cartCount = 0;
  searchParam = "search";
  searchTerm!: string;
  currentUrl = '';
  isLanguageDropdownOpen = false;
  isMobileNavOpen = false;
  isMobileCatalogOpen = false;
  expandedMobileType: string | number | null = null;
  private openMenuTimer: ReturnType<typeof setTimeout> | null = null;
  private closeMenuTimer: ReturnType<typeof setTimeout> | null = null;
  navProductLinks: NavProductLink[] = [];
  topNavLinks: TopNavLink[] = [];
  staticNavLinks: Array<{ label: string; path: string }> = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private route: ActivatedRoute,
              private router: Router,
              private translateService: TranslateService,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              private cartService: CartProductService,
              private qpService: QueryParamsService,
              private toastr: ToastrService,
              private destroy: DestroyRef,
              private elementRef: ElementRef
  ) {
    this.searchTerm = this.qpService.getParamValue(this.searchParam) || "";
  }

  @HostListener('window:resize', ['$event'])
  checkScreenSize(event?: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 769;
      this.sizeChecked = true;

      if (!this.isMobile) {
        this.isMobileNavOpen = false;
        this.isMobileCatalogOpen = false;
        this.unlockScroll();
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isLanguageDropdownOpen = false;
      this.toggleMenuOpened(false);
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUrl = this.router.url;
      this.selectedLanguage = this.getLanguage().toUpperCase();
      this.getMenuKeys();
      this.rebuildNavLabels();
      this.checkScreenSize();

      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroy)
      ).subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || this.router.url;
        this.selectedLanguage = this.getLanguage().toUpperCase();
        this.menuOpened = false;
        this.isMobileNavOpen = false;
        this.isMobileCatalogOpen = false;
        this.unlockScroll();
      });

      this.publicService.getLanguages().pipe(takeUntilDestroyed(this.destroy)).subscribe((languages: any) => {
        const apiLanguages = languages?.data?.map((el: any) => String(el.key || '').toUpperCase()).filter(Boolean) || [];
        const mergedLanguages = Array.from(new Set([...apiLanguages, ...FALLBACK_LANGUAGES]));
        this.languages = mergedLanguages;

        if (!this.languages.includes(this.selectedLanguage)) {
          this.selectedLanguage = 'RO';
          this.translateService.translate('ro');
        }

        this.cdr.detectChanges();
      });

      this.publicService.getGeneralDetails().pipe(takeUntilDestroyed(this.destroy)).subscribe((response: any) => {
        if (response && response.data) {
          this.generalDetails = {
            main_phone: findObjectByKey(response.data?.[0]?.data, 'main_phone'),
            catalog: findObjectByKey(response.data?.[0]?.data, 'catalog'),
          };
        }
      });

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

      if (!this.languages.length) {
        this.languages = [...FALLBACK_LANGUAGES];
      }
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getProductsData();
    }
  }

  ngOnDestroy() {
    if (this.openMenuTimer) {
      clearTimeout(this.openMenuTimer);
      this.openMenuTimer = null;
    }

    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
      this.closeMenuTimer = null;
    }
    this.unlockScroll();
  }

  getProductsData() {
    this.productsMenuData = [];

    const params = {
      page: 1,
      rowsPerPage: 1000
    };

    forkJoin([
      this.publicService.getProductsFilterLabels().pipe(catchError(() => of([]))),
      this.publicService.getProductTypes(params).pipe(catchError(() => of({data: []})))
    ]).pipe(
      tap(([labels, types]) => {
        const labelTypes = (labels || []).filter((el: any) => el['product_type']);
        const labelCategories = (labels || []).filter((el: any) => el['product_category']);

        const filteredTypes = types?.data.filter((el: any) =>
          findObjectByKey(el.data, 'show_in_filters') &&
          labelTypes.some((labelType: any) =>
            labelType['product_type']?.some((pt: any) => pt['value']?.['id'] === el.id)
          )
        ).map((el: any) => {
          const allCategories = findObjectByKey(el.data, 'categories') || [];
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

        this.navProductLinks = this.productsMenuData.map((item: any) => ({
          label: this.getLocalizedLabel(item.type?.label),
          filter: `product_type_contains_${this.getLocalizedLabel(item.type?.label)}`
        }));

        this.ensureActiveTypeAndCategory();

        this.cdr.detectChanges();

        this.productsMenuData.forEach((el: any, typeIndex: number) => {
          forkJoin((el.categories || []).map((category: any) => this.publicService.getProducts({
            page: 1,
            rowsPerPage: 1000,
            filter: 'product_category_contains_' + category.label[Object.keys(category.label)[0]],
            sortBy: 'created_at',
            sortOrder: 'DESC'
          }).pipe(catchError(() => of({data: []}))))).pipe(
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
    });
  }

  downloadPdfFromStorage(pdfData: string) {
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = 'Catalog.pdf';
    link.click();
  }

  switchLanguage(language: string) {
    const normalized = language.toLowerCase();
    this.selectedLanguage = normalized.toUpperCase();
    this.translateService.translate(normalized);
    this.isLanguageDropdownOpen = false;
    this.rebuildNavLabels();

    this.navProductLinks = this.productsMenuData.map((item: any) => ({
      label: this.getLocalizedLabel(item.type?.label),
      filter: `product_type_contains_${this.getLocalizedLabel(item.type?.label)}`
    }));
  }

  toggleLanguageDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  selectLanguage(language: string, event: MouseEvent) {
    event.stopPropagation();
    this.switchLanguage(language);
  }

  getMenuKeys(): void {
    this.menuKeys = Object.keys(this.data?.MENU);
  }

  toggleOpenCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  setActiveType(id: any) {
    this.productsMenuData.forEach((el: any) => {
      el.type.active = el.type.id === id;
    });
  }

  setActiveCategory(id: any, products: MenuProduct[] = []) {
    this.activeCategoryId = id;
    this.showProducts = products;
  }

  toggleMenuOpened(value: boolean, avoidToggle?: boolean) {
    if (!avoidToggle) {
      this.menuOpened = value;
      if (value) {
        this.ensureActiveTypeAndCategory();
      }
      this.syncScrollLock();
    }
  }

  onNavMouseEnter() {
    if (this.isMobile) {
      return;
    }

    if (this.openMenuTimer) {
      clearTimeout(this.openMenuTimer);
    }

    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
      this.closeMenuTimer = null;
    }

    this.openMenuTimer = setTimeout(() => {
      this.toggleMenuOpened(true);
      this.openMenuTimer = null;
    }, 90);
  }

  onNavMouseLeave() {
    if (this.isMobile) {
      return;
    }

    if (this.openMenuTimer) {
      clearTimeout(this.openMenuTimer);
      this.openMenuTimer = null;
    }

    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
    }

    this.closeMenuTimer = setTimeout(() => {
      this.toggleMenuOpened(false);
    }, 220);
  }

  toggleMobileNav(value?: boolean) {
    if (!this.isMobile) {
      return;
    }

    this.isMobileNavOpen = typeof value === 'boolean' ? value : !this.isMobileNavOpen;

    if (!this.isMobileNavOpen) {
      this.isMobileCatalogOpen = false;
    }

    this.syncScrollLock();
  }

  toggleMobileCatalog() {
    this.isMobileCatalogOpen = !this.isMobileCatalogOpen;
  }

  toggleMobileType(typeId: string | number) {
    this.expandedMobileType = this.expandedMobileType === typeId ? null : typeId;
  }

  handleTopNavClick(link: TopNavLink) {
    if (link.type === 'route' && link.path) {
      this.goToNavLink({path: link.path, query: link.query || {sortBy: 'created_at', sortOrder: 'DESC', page: 1, rowsPerPage: 12}});
      return;
    }

    this.goToCategoryByName(link.label);
  }

  goToCategoryByName(label: string) {
    const normalizedTarget = this.normalizeText(label);
    let matchedCategory: any = null;

    this.productsMenuData.some((productType: any) => {
      const category = (productType.categories || []).find((item: any) => {
        const categoryLabel = this.getLocalizedLabel(item.label);
        return this.normalizeText(categoryLabel).includes(normalizedTarget)
          || normalizedTarget.includes(this.normalizeText(categoryLabel));
      });

      if (category) {
        matchedCategory = category;
      }

      return !!matchedCategory;
    });

    if (matchedCategory) {
      this.goToCategoryMobile(matchedCategory);
      return;
    }

    this.goToProductType({label, filter: `product_category_contains_${label}`});
  }

  goToHome() {
    this.router.navigate([`/${this.getLanguage()}`]);
    this.toggleMenuOpened(false);
    this.toggleMobileNav(false);
  }

  goToCategory(url: string, label: any) {
    const language = this.getLanguage();
    const localizedLabel = typeof label === 'string' ? label : (label[language] || label['ro']);

    this.router.navigate([`/${language}${url}`], {
      queryParams: {
        sortBy: 'created_at',
        sortOrder: 'DESC',
        page: 1,
        rowsPerPage: 12,
        filter: `product_category_contains_${localizedLabel}`
      }
    });

    this.toggleMenuOpened(false);
    this.toggleMobileNav(false);
  }

  goToCategoryMobile(category: { id: string | number; label: any }) {
    const language = this.getLanguage();
    this.router.navigate([`/${language}/products`], {
      queryParams: {
        sortBy: 'created_at',
        sortOrder: 'DESC',
        page: 1,
        rowsPerPage: 12,
        filter: `product_category_contains_${this.getLocalizedLabel(category.label)}`
      }
    });

    this.toggleMenuOpened(false);
    this.toggleMobileNav(false);
  }

  goToNavLink(link: { path: string; query?: any }) {
    const language = this.getLanguage();
    this.router.navigate([`/${language}${link.path}`], {
      queryParams: link.query || {}
    });
    this.toggleMenuOpened(false);
    this.toggleMobileNav(false);
  }

  goToProductType(link: NavProductLink) {
    const language = this.getLanguage();
    this.router.navigate([`/${language}/products`], {
      queryParams: {
        sortBy: 'created_at',
        sortOrder: 'DESC',
        page: 1,
        rowsPerPage: 12,
        filter: link.filter
      }
    });
    this.toggleMenuOpened(false);
    this.toggleMobileNav(false);
  }

  isActiveNav(path: string): boolean {
    if (!this.currentUrl) {
      return false;
    }

    const normalizedCurrent = this.currentUrl.replace(/^\/[a-z]{2}(?=\/)/i, '');
    return normalizedCurrent.startsWith(path);
  }

  isTopNavLinkActive(link: TopNavLink): boolean {
    if (link.type === 'route' && link.path) {
      return this.isActiveNav(link.path);
    }

    const filter = this.normalizeText(this.qpService.getParamValue('filter') || '');
    const label = this.normalizeText(link.label);

    if (!filter || !this.isActiveNav('/products')) {
      return false;
    }

    return filter.includes(label);
  }

  getLocalizedLabel(label: any): string {
    if (!label) {
      return '';
    }

    if (typeof label === 'string') {
      return label;
    }

    const language = this.getLanguage();
    return label[language] || label['ro'] || (Object.values(label)[0] as string);
  }

  private getLanguage(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'ro';
    }

    return (localStorage.getItem('language') || 'ro').toLowerCase();
  }

  private normalizeText(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }

  private ensureActiveTypeAndCategory() {
    if (!this.productsMenuData.length) {
      return;
    }

    const hasActive = this.productsMenuData.some((item: any) => item.type?.active);
    if (!hasActive) {
      this.productsMenuData[0].type.active = true;
    }

    const activeType = this.productsMenuData.find((item: any) => item.type?.active) || this.productsMenuData[0];
    const firstCategory = activeType?.categories?.[0];

    if (firstCategory) {
      this.activeCategoryId = firstCategory.id;
      this.showProducts = firstCategory.products || [];
    }
  }

  private rebuildNavLabels() {
    const language = this.getLanguage();

    // Desktop/mobile menu is admin-driven (Catalog dropdown / productsMenuData).
    // The old hardcoded category shortcuts are intentionally not shown.
    this.topNavLinks = [];

    this.staticNavLinks = [
      {label: language === 'ru' ? 'Блог' : language === 'en' ? 'Blog' : 'Blog', path: '/blog'},
      {label: language === 'ru' ? 'Наши проекты' : language === 'en' ? 'Our Projects' : 'Proiectele Noastre', path: '/proiecte'},
      {label: language === 'ru' ? 'Контакты' : language === 'en' ? 'Contacts' : 'Contacte', path: '/contacts'}
    ];
  }

  private syncScrollLock() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.isMobileNavOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return;
    }

    this.unlockScroll();
  }

  private unlockScroll() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
}
