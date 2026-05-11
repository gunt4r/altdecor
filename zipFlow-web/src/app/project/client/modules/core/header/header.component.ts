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
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {PageSlug} from "../../shared/components/page-container/pages.type";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {TranslateService} from "../../shared/services/translate.service";
import {PublicService} from "../../shared/services/public.service";
import {CartProductService} from "../../shared/services/cart-products.service";
import {catchError, debounceTime, filter, forkJoin, of, Subject, Subscription, tap} from "rxjs";
import {switchMap} from "rxjs/operators";
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

interface ClientSearchResult {
  id: string | number;
  title: string;
  image: string;
  price: string;
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
  selectedLanguage = 'RO';
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
  private _desktopMenuConfig: any[] = [];
  private _drawerMenuConfig: any[] = [];
  private _hoverableMenuConfig: any[] = [];
  private _catalogPdfUrl = '';
  private _siteConfigLoaded = false;

  // Client search
  isSearchOpen = false;
  clientSearchQuery = '';
  clientSearchResults: ClientSearchResult[] = [];
  isClientSearching = false;
  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  get searchPlaceholder(): string {
    const lang = this.getLanguage();
    return lang === 'ru' ? 'Поиск товаров...' : lang === 'en' ? 'Search products...' : 'Caută produse...';
  }

  get searchNoResults(): string {
    const lang = this.getLanguage();
    return lang === 'ru' ? 'Ничего не найдено' : lang === 'en' ? 'No results found' : 'Niciun rezultat găsit';
  }

  get drawerMenuItems(): any[] {
    if (this._drawerMenuConfig.length) {
      return this._drawerMenuConfig.map((item: any, index: number) => {
        const lang = this.getLanguage();
        const label = typeof item.label === 'object' ? (item.label?.[lang] || item.label?.['ro'] || '') : (item.label || '');
        const children = (item.children || []).map((child: any) => {
          const childLabel = typeof child.label === 'object' ? (child.label?.[lang] || child.label?.['ro'] || '') : (child.label || '');
          return {label: childLabel, link: child.link || ''};
        }).filter((child: any) => child.label?.trim());
        return {
          type: {id: `drawer-${index}`, label: {[lang]: label, ro: label}, active: false},
          categories: children,
          drawerIcon: item.icon || '',
          drawerLink: item.link || ''
        };
      }).filter((item: any) => {
        const lang = this.getLanguage();
        const label = typeof item.type.label === 'object' ? (item.type.label?.[lang] || item.type.label?.['ro'] || '') : (item.type.label || '');
        return label?.trim();
      });
    }
    return this.productsMenuData;
  }

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

      this.loadSiteConfig();

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

      // Setup client search pipeline
      this.searchSub = this.searchSubject.pipe(
        debounceTime(350),
        filter(q => q.length >= 2),
        tap(() => { this.isClientSearching = true; this.cdr.detectChanges(); }),
        switchMap(q => {
          const searchParam = `title_contains_${q}_or_product_type_contains_${q}_or_product_category_contains_${q}_or_model_contains_${q}`;
          return this.publicService.getProducts({ page: 1, rowsPerPage: 8, search: searchParam }).pipe(
            catchError(() => of({ data: [] }))
          );
        })
      ).subscribe((res: any) => {
        const products = res?.data || [];
        this.clientSearchResults = products.slice(0, 8).map((p: any) => {
          const data = p.data || [];
          const titleObj = findObjectByKey(data, 'title');
          const imagesArr = findObjectByKey(data, 'images');
          const configs = findObjectByKey(data, 'configurations') || [];
          const mainConfig = configs?.[0]?.configuration?.[0] || {};
          const currentPrice = mainConfig?.price?.[0];
          const priceStr = currentPrice?.value ? `${currentPrice.value} ${currentPrice.currency || 'MDL'}` : '';
          const firstImage = Array.isArray(imagesArr) && imagesArr.length ? (imagesArr[0]?.file_url || imagesArr[0]?.url || '') : '';
          return {
            id: p.id,
            title: this.getLocalizedLabel(titleObj) || ('Product ' + p.id),
            image: firstImage,
            price: priceStr
          };
        });
        this.isClientSearching = false;
        this.cdr.detectChanges();
      });
    }
  }

  ngAfterViewInit() {
    // Products are now loaded by loadSiteConfig after it completes.
    // This serves as a fallback only if siteConfig somehow fails to load.
    if (isPlatformBrowser(this.platformId) && !this._siteConfigLoaded) {
      setTimeout(() => {
        if (!this._siteConfigLoaded && !this.productsMenuData.length) {
          this.getProductsData();
        }
      }, 3000);
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
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  toggleSearch(open?: boolean) {
    this.isSearchOpen = open !== undefined ? open : !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 100);
    } else {
      this.clientSearchQuery = '';
      this.clientSearchResults = [];
    }
    this.cdr.detectChanges();
  }

  onClientSearch(query: string) {
    if (query.length < 2) {
      this.clientSearchResults = [];
      this.cdr.detectChanges();
      return;
    }
    this.searchSubject.next(query);
  }

  goToProduct(id: string | number) {
    this.toggleSearch(false);
    this.router.navigate([`/${this.getLanguage()}/products`, id]);
  }

  goToSearchResults() {
    const query = this.clientSearchQuery.trim();
    if (!query) return;
    this.toggleSearch(false);
    this.router.navigate([`/${this.getLanguage()}/products`], {
      queryParams: { search: query, sortBy: 'created_at', sortOrder: 'DESC', page: 1, rowsPerPage: 12 }
    });
  }

  getProductsData() {
    // Skip if mega menu is configured from admin hoverable_menu
    if (this._hoverableMenuConfig.length || this.productsMenuData.length) return;
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
          const matchedConfig = this._desktopMenuConfig.find((cfg: any) => {
            const cfgLabel = typeof cfg.label === 'object' ? (cfg.label?.['ro'] || '') : (cfg.label || '');
            const typeLabel = typeof label === 'object' ? (label?.['ro'] || '') : (label || '');
            return cfgLabel.toLowerCase() === typeLabel.toLowerCase();
          });
          this.productsMenuData.push({
            type: {
              label,
              id,
              active: false
            },
            desktopIcon: matchedConfig?.icon || '',
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
    // Prefer site_config catalog_pdf
    if (this._catalogPdfUrl) {
      window.open(this._catalogPdfUrl, '_blank');
      return;
    }
    // Fallback to general_details
    if (catalog?.[0]?.file_url) {
      window.open(catalog[0].file_url, '_blank');
    }
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
      this.cdr.detectChanges();
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
      this.cdr.detectChanges();
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

  private categoryIconMap: Record<string, string> = {
    'perete': 'layers',
    'podea': 'hexagon',
    'tavan': 'home',
    'plinte': 'ruler',
    'profile': 'sliders',
    'adeziv': 'droplets',
    'accesorii': 'settings',
  };

  private subcategoryIconMap: Record<string, string> = {
    'pvc': 'pentagon',
    'spc': 'palette',
    'poliuretan': 'box',
    'autocolante': 'sticker',
    'bambus': 'leaf',
  };

  loadNavigationConfig() {
    this.publicService.getNavigationConfig().pipe(
      catchError(() => of({data: []})),
      takeUntilDestroyed(this.destroy)
    ).subscribe((res: any) => {
      const items = res?.data || [];
      items.forEach((item: any) => {
        const d = item.data?.[0] || item;
        const key = (d.match_key || '').toLowerCase();
        const icon = d.icon_key;
        const target = d.type === 'subcategory' ? this.subcategoryIconMap : this.categoryIconMap;
        if (key && icon) {
          target[key] = icon;
        }
      });
      this.cdr.detectChanges();
    });
  }

  private readonly KNOWN_ICONS = new Set([
    'layers', 'hexagon', 'square', 'puzzle', 'home', 'ruler',
    'sliders', 'droplets', 'settings', 'pentagon', 'palette',
    'box', 'sticker', 'leaf'
  ]);

  getIconKey(productType: any): string {
    const icon = productType.drawerIcon || '';
    if (icon.includes('/')) return '__img__';
    if (this.KNOWN_ICONS.has(icon)) return icon;
    return this.getCategoryIcon(productType.type?.label);
  }

  getStaticLinkLabel(key: string): string {
    const language = this.getLanguage();
    const labels: Record<string, Record<string, string>> = {
      blog: {ro: 'Blog', ru: 'Блог', en: 'Blog'},
      contacts: {ro: 'Contacte', ru: 'Контакты', en: 'Contacts'},
      viewAll: {ro: 'Vezi tot', ru: 'Смотреть все', en: 'View all'}
    };
    return labels[key]?.[language] || labels[key]?.['ro'] || key;
  }

  getDesktopIconKey(productType: any): string {
    const icon = productType.desktopIcon || '';
    if (icon.includes('/')) return '__img__';
    if (this.KNOWN_ICONS.has(icon)) return icon;
    return this.getCategoryIcon(productType.type?.label);
  }

  getCategoryIcon(label: any): string {
    const text = this.normalizeText(this.getLocalizedLabel(label));
    for (const [key, icon] of Object.entries(this.categoryIconMap)) {
      if (text.includes(key)) return icon;
    }
    return 'layers';
  }

  getSubcategoryIcon(label: any): string {
    const text = this.normalizeText(this.getLocalizedLabel(label));
    for (const [key, icon] of Object.entries(this.subcategoryIconMap)) {
      if (text.includes(key)) return icon;
    }
    return 'circle';
  }

  getNavLinkIcon(label: string): string {
    const text = this.normalizeText(label);
    for (const [key, icon] of Object.entries(this.categoryIconMap)) {
      if (text.includes(key)) return icon;
    }
    return 'arrow-right';
  }

  get mobileNavLinks(): TopNavLink[] {
    const productTypeLabels = new Set(
      this.productsMenuData.map((item: any) =>
        this.normalizeText(this.getLocalizedLabel(item.type?.label))
      )
    );

    return this.topNavLinks.filter(link => {
      if (link.type === 'route') return true;
      return !productTypeLabels.has(this.normalizeText(link.label));
    });
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

    // Try matching a product type
    const matchedType = this.productsMenuData.find((productType: any) => {
      const typeLabel = this.normalizeText(this.getLocalizedLabel(productType.type?.label));
      return typeLabel.includes(normalizedTarget) || normalizedTarget.includes(typeLabel);
    });

    if (matchedType) {
      this.goToProductType({
        label: this.getLocalizedLabel(matchedType.type?.label),
        filter: `product_type_contains_${this.getLocalizedLabel(matchedType.type?.label)}`
      });
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

    // If the URL already contains query params, parse and use them as-is
    if (url && url.includes('?')) {
      const [path, qs] = url.split('?');
      const queryParams = this.parseQueryString(qs);
      this.router.navigate([`/${language}${path}`], {queryParams});
      this.toggleMenuOpened(false);
      this.toggleMobileNav(false);
      return;
    }

    const localizedLabel = typeof label === 'string' ? label : (label[language] || label['ro']);

    this.router.navigate([`/${language}${url || '/products'}`], {
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

  goToCategoryMobile(category: any) {
    const language = this.getLanguage();

    // If the category has a direct link (from drawer config), use it
    if (category.link) {
      this.toggleMenuOpened(false);
      this.toggleMobileNav(false);
      if (category.link.includes('?')) {
        const [path, qs] = category.link.split('?');
        const queryParams = this.parseQueryString(qs);
        this.router.navigate([`/${language}${path}`], {queryParams});
      } else {
        this.router.navigate([`/${language}${category.link}`]);
      }
      return;
    }

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

  goToTypeLink(productType: any) {
    const link = productType.typeLink;
    if (!link) return;
    const language = this.getLanguage();
    if (link.includes('?')) {
      const [path, qs] = link.split('?');
      const queryParams = this.parseQueryString(qs);
      this.router.navigate([`/${language}${path}`], {queryParams});
    } else {
      this.router.navigate([`/${language}${link}`]);
    }
    this.toggleMenuOpened(false);
    this.toggleMobileNav(false);
  }

  private parseQueryString(qs: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (!qs) return params;
    qs.split('&').forEach((pair: string) => {
      const eqIdx = pair.indexOf('=');
      if (eqIdx > 0) {
        params[decodeURIComponent(pair.substring(0, eqIdx))] = decodeURIComponent(pair.substring(eqIdx + 1));
      }
    });
    return params;
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
      if (link.path === '/products' && link.query?.filter) {
        const currentFilter = this.normalizeText(this.qpService.getParamValue('filter') || '');
        const linkFilter = this.normalizeText(link.query.filter);
        return this.isActiveNav('/products') && currentFilter === linkFilter;
      }
      if (link.path === '/products' && link.query?.search) {
        const currentSearch = this.normalizeText(this.qpService.getParamValue('search') || '');
        const linkSearch = this.normalizeText(link.query.search);
        return this.isActiveNav('/products') && currentSearch === linkSearch;
      }
      if (link.path === '/products') {
        const currentFilter = this.qpService.getParamValue('filter') || '';
        return this.isActiveNav('/products') && !currentFilter;
      }
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

  private parseLinkQuery(link?: string): any {
    if (!link || !link.includes('?')) {
      return undefined;
    }

    const [, queryString] = link.split('?');
    const params: Record<string, string> = {};

    queryString.split('&').forEach((pair) => {
      const [rawKey, rawValue] = pair.split('=');
      if (!rawKey || rawValue === undefined) {
        return;
      }

      params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
    });

    return Object.keys(params).length ? params : undefined;
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
    // If we have dynamic config, use it
    if (this._desktopMenuConfig.length) {
      this.topNavLinks = this._desktopMenuConfig
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((item: any) => {
          const label = this.getLocalizedLabel(item.label) || '';
          const link = item.link || '';
          if (link.includes('product_category_contains_') || link.includes('product_type_contains_')) {
            // Has a filter — determine type
            const isType = link.includes('product_type_contains_');
            const filterMatch = link.match(/filter=(.+?)(?:&|$)/);
            const filterValue = filterMatch ? filterMatch[1] : '';
            return {
              label,
              type: (isType ? 'route' : 'category') as 'route' | 'category',
              path: '/products',
              query: this.parseLinkQuery(link)
            };
          }
          return {label, type: 'route' as 'route', path: link || '/products', query: this.parseLinkQuery(link)};
        });
    } else {
      const language = this.getLanguage();
      const t = (ro: string, ru: string, en: string) =>
        language === 'ru' ? ru : language === 'en' ? en : ro;
      this.topNavLinks = [
        {label: t('Promoții', 'Промо', 'Promotions'), type: 'route', path: '/products',
          query: {sortBy: 'created_at', sortOrder: 'DESC', page: 1, rowsPerPage: 12, filter: 'product_type_contains_Promoții'}},
        {label: t('Perete', 'Стена', 'Wall'), type: 'category'},
        {label: t('Podea', 'Пол', 'Floor'), type: 'category'},
        {label: t('Tavan', 'Потолок', 'Ceiling'), type: 'route', path: '/products',
          query: {sortBy: 'created_at', sortOrder: 'DESC', page: 1, rowsPerPage: 12, filter: 'product_type_contains_Panou decorativ INTERIOR'}},
        {label: t('Accesorii', 'Аксессуары', 'Accessories'), type: 'route', path: '/products',
          query: {sortBy: 'created_at', sortOrder: 'DESC', page: 1, rowsPerPage: 12, filter: 'product_type_contains_Profil'}}
      ];
    }

    const language = this.getLanguage();
    const t2 = (ro: string, ru: string, en: string) =>
      language === 'ru' ? ru : language === 'en' ? en : ro;
    this.staticNavLinks = [
      {label: t2('Blog', 'Блог', 'Blog'), path: '/blog'},
      {label: t2('Contacte', 'Контакты', 'Contacts'), path: '/contacts'}
    ];
  }

  /**
   * Build mega menu from admin hoverable_menu config entries.
   * Each entry becomes a section (product type), its children become categories.
   * Products are loaded from the API based on category filter links.
   */
  private buildMegaMenuFromConfig() {
    // Match desktop_menu icons by comparing labels
    this.productsMenuData = this._hoverableMenuConfig.map((section: any, idx: number) => {
      const matchedConfig = this._desktopMenuConfig.find((cfg: any) => {
        const cfgLabel = typeof cfg.label === 'object' ? (cfg.label?.['ro'] || '') : (cfg.label || '');
        const secLabel = typeof section.label === 'object' ? (section.label?.['ro'] || '') : (section.label || '');
        return cfgLabel.toLowerCase() === secLabel.toLowerCase();
      });
      return {
        type: {
          label: section.label,
          id: `config-${idx}`,
          active: idx === 0
        },
        typeLink: section.link || '',
        desktopIcon: matchedConfig?.icon || '',
        categories: (section.children || []).map((child: any, cIdx: number) => ({
          label: child.label,
          id: `config-${idx}-${cIdx}`,
          url: child.link || '/products',
          products: []
        }))
      };
    });

    this.navProductLinks = this.productsMenuData.map((item: any) => ({
      label: this.getLocalizedLabel(item.type?.label),
      filter: `product_type_contains_${this.getLocalizedLabel(item.type?.label)}`
    }));

    this.ensureActiveTypeAndCategory();
    this.cdr.detectChanges();

    this.productsMenuData.forEach((section: any, typeIndex: number) => {
      if (!section.categories?.length) return;
      const requests = section.categories.map((cat: any) => {
        const catLabel = this.getLocalizedLabel(cat.label);
        return this.publicService.getProducts({
          page: 1,
          rowsPerPage: 21,
          filter: `product_category_contains_${catLabel}`,
          sortBy: 'created_at',
          sortOrder: 'DESC'
        }).pipe(catchError(() => of({data: []})));
      });
      forkJoin(requests).pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe((data: any) => {
        data.forEach((productData: any, index: number) => {
          this.productsMenuData[typeIndex].categories[index].products = productData?.data?.map((product: any) => ({
            image: findObjectByKey(product.data, 'images')?.[0]?.['file_url'],
            title: findObjectByKey(product.data, 'title'),
            id: product.id,
            url: `/products/${product.id}`
          })) || [];
        });

        if (typeIndex === 0 && this.productsMenuData[0]?.categories?.length) {
          this.showProducts = this.productsMenuData[0].categories[0].products || [];
          this.activeCategoryId = this.productsMenuData[0].categories[0].id;
        }
        this.cdr.detectChanges();
      });
    });
  }

  private loadSiteConfig() {
    this.publicService.getSiteConfig({page: 1, rowsPerPage: 100}).pipe(
      catchError(() => of({data: []})),
      takeUntilDestroyed(this.destroy)
    ).subscribe((response: any) => {
      const items = response?.data || [];
      const language = this.getLanguage();

      this._desktopMenuConfig = items
        .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'desktop_menu')
        .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false)
        .map((item: any) => ({
          label: findObjectByKey(item.data, 'label'),
          link: findObjectByKey(item.data, 'link') || '',
          icon: findObjectByKey(item.data, 'icon') || '',
          order: findObjectByKey(item.data, 'order_index') || 0,
          children: findObjectByKey(item.data, 'children') || []
        }));

      this._drawerMenuConfig = items
        .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'drawer_menu')
        .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false)
        .map((item: any) => ({
          label: findObjectByKey(item.data, 'label'),
          link: findObjectByKey(item.data, 'link') || '',
          icon: findObjectByKey(item.data, 'icon') || '',
          order: findObjectByKey(item.data, 'order_index') || 0,
          children: findObjectByKey(item.data, 'children') || []
        }));

      const catalogPdfEntries = items
        .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'catalog_pdf')
        .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false);

      if (catalogPdfEntries.length > 0) {
        const catalogLink = findObjectByKey(catalogPdfEntries[0].data, 'link');
        if (catalogLink) {
          this._catalogPdfUrl = catalogLink;
        }
      }

      // Hoverable menu (mega menu structure from admin)
      this._hoverableMenuConfig = items
        .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'hoverable_menu')
        .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false)
        .sort((a: any, b: any) => (findObjectByKey(a.data, 'order_index') || 0) - (findObjectByKey(b.data, 'order_index') || 0))
        .map((item: any) => ({
          label: findObjectByKey(item.data, 'label'),
          link: findObjectByKey(item.data, 'link') || '',
          order: findObjectByKey(item.data, 'order_index') || 0,
          children: (findObjectByKey(item.data, 'children') || []).filter((c: any) => {
            const lbl = c.label;
            return typeof lbl === 'object' ? (lbl?.ro?.trim() || lbl?.ru?.trim() || lbl?.en?.trim()) : (lbl && lbl.trim());
          })
        }));

      this.rebuildNavLabels();
      this._siteConfigLoaded = true;
      if (this._hoverableMenuConfig.length) {
        this.buildMegaMenuFromConfig();
      } else {
        this.getProductsData();
      }
      this.cdr.detectChanges();
    });
  }

  private syncScrollLock() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Only lock scroll for mobile nav overlay — desktop mega-menu should not lock scroll
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

  navigateDrawerLink(link: string) {
    this.toggleMobileNav(false);
    const lang = this.getLanguage();
    if (link.includes('?')) {
      const [path, qs] = link.split('?');
      const queryParams: any = {};
      qs.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k && v) queryParams[decodeURIComponent(k)] = decodeURIComponent(v);
      });
      this.router.navigate([`/${lang}${path}`], {queryParams});
    } else {
      this.router.navigate([`/${lang}${link}`]);
    }
  }
}
