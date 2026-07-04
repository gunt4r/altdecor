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
import {catchError, debounceTime, filter, forkJoin, of, Subject, tap} from "rxjs";
import {QueryParamsService} from "../../../../../theme/shared/services/query-params.service";
import {getApiParams, LinkWord, ParamsPrefix, SortTypes} from "../../../../../theme/client/utils/api-params.utils";
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
  type: 'category' | 'route' | 'link';
  path?: string;
  query?: any;
  link?: string;
  icon?: string;
}

const FALLBACK_LANGUAGES = ['RO', 'RU', 'EN'];

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  // The header is highly interactive (cart, language/search/catalog dropdowns) and
  // was producing SSR hydration mismatches that left toggles broken. Skip hydration
  // so it renders cleanly on the client.
  host: {ngSkipHydration: 'true'}
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
  isSearchOpen = false;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  isSideMenuOpen: boolean = false;
  isMobile: boolean = false;
  sizeChecked: boolean = false;
  languages: string[] = [];
  cartCount = 0;
  searchParam = "search";
  searchTerm!: string;
  // Live product-search popover (client-facing content only — products, not admin entities).
  searchResults: MenuProduct[] = [];
  isSearchLoading = false;
  showSearchResults = false;
  private searchSubject = new Subject<string>();
  currentUrl = '';
  isLanguageDropdownOpen = false;
  isMobileNavOpen = false;
  isMobileCatalogOpen = false;
  expandedMobileType: string | number | null = null;
  private openMenuTimer: ReturnType<typeof setTimeout> | null = null;
  private closeMenuTimer: ReturnType<typeof setTimeout> | null = null;
  navProductLinks: NavProductLink[] = [];
  // Flat desktop nav (admin "Desktop Menu" config). First MAX_FLAT_NAV shown
  // inline; any beyond that collapse into the "More" dropdown.
  topNavLinks: TopNavLink[] = [];
  overflowNavLinks: TopNavLink[] = [];
  moreMenuOpen = false;
  // Mobile drawer (admin "Drawer Menu") — flat links.
  drawerMenuLinks: TopNavLink[] = [];
  private desktopMenuRaw: { label: any; link: string; order: number; icon?: string }[] = [];
  private drawerMenuRaw: { label: any; link: string; order: number; icon?: string }[] = [];
  private readonly MAX_FLAT_NAV = 4;
  staticNavLinks: Array<{ label: string; path: string; icon?: string }> = [];

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
      this.showSearchResults = false;
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUrl = this.router.url;
      this.selectedLanguage = this.getLanguage().toUpperCase();
      this.getMenuKeys();
      this.rebuildNavLabels();
      this.loadMenus();
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

      // Debounced live product search for the header popover.
      this.searchSubject.pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroy)
      ).subscribe((term: string) => this.runProductSearch(term));

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

  toggleSearch(open?: boolean): void {
    this.isSearchOpen = open ?? !this.isSearchOpen;
    if (this.isSearchOpen && isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
    } else {
      this.showSearchResults = false;
      this.searchResults = [];
    }
  }

  // Live typeahead: as the user types, fetch matching PRODUCTS only (client content)
  // and show them in the popover. Enter / "see all" still opens the full results page.
  onSearchInput(value: string): void {
    this.searchTerm = value;
    const term = (value || '').trim();
    if (term.length < 2) {
      this.searchResults = [];
      this.showSearchResults = false;
      this.isSearchLoading = false;
      return;
    }
    this.showSearchResults = true;
    this.isSearchLoading = true;
    this.searchSubject.next(term);
  }

  private runProductSearch(term: string): void {
    if (!term || term.trim().length < 2) {
      this.isSearchLoading = false;
      return;
    }

    const searchParam = [
      {key: 'product_type', value: term, linkWord: LinkWord.CONTAINS, prefix: ParamsPrefix.OR},
      {key: 'product_category', value: term, linkWord: LinkWord.CONTAINS, prefix: ParamsPrefix.OR},
      {key: 'title', value: term, linkWord: LinkWord.CONTAINS}
    ];
    const params = getApiParams(searchParam, undefined, {sortBy: 'created_at', sortOrder: SortTypes.DESC}, 1, 6, false);

    this.publicService.getProducts(params).pipe(
      catchError(() => of({data: []})),
      takeUntilDestroyed(this.destroy)
    ).subscribe((res: any) => {
      // Ignore a stale response if the user has kept typing.
      if ((this.searchTerm || '').trim() !== term) {
        return;
      }
      this.searchResults = (res?.data || []).map((product: any) => ({
        id: product.id,
        title: this.getLocalizedLabel(findObjectByKey(product.data, 'title')),
        image: findObjectByKey(product.data, 'images')?.[0]?.['file_url'] || '',
        url: `/products/${product.id}`
      }));
      this.isSearchLoading = false;
      this.cdr.detectChanges();
    });
  }

  selectSearchResult(product: MenuProduct): void {
    this.showSearchResults = false;
    this.searchResults = [];
    this.isSearchOpen = false;
    this.router.navigate([`/${this.getLanguage()}/products/${product.id}`]);
    this.toggleMobileNav(false);
  }

  submitSearch(): void {
    const term = (this.searchInput?.nativeElement?.value || this.searchTerm || '').trim();
    if (!term) {
      return;
    }
    const language = this.getLanguage();
    this.showSearchResults = false;
    this.searchResults = [];
    this.router.navigate([`/${language}/products`], {
      queryParams: {search: term, sortBy: 'created_at', sortOrder: 'DESC', page: 1, rowsPerPage: 12}
    });
    this.isSearchOpen = false;
    this.toggleMobileNav(false);
  }

  get searchPlaceholder(): string {
    const l = this.getLanguage();
    return l === 'ru' ? 'Поиск товаров...' : l === 'en' ? 'Search products...' : 'Caută produse...';
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
    if (link.type === 'link' && link.link) {
      this.goToRawLink(link.link);
      return;
    }

    if (link.type === 'route' && link.path) {
      this.goToNavLink({path: link.path, query: link.query || {sortBy: 'created_at', sortOrder: 'DESC', page: 1, rowsPerPage: 12}});
      return;
    }

    this.goToCategoryByName(link.label);
  }

  // Navigate to an admin-provided menu link. Handles both a relative "/products?..."
  // path and a full "https://altdecor.md/ro/products?..." URL; strips any origin and
  // leading language segment, then re-prefixes with the active language.
  goToRawLink(link: string) {
    const language = this.getLanguage();
    let path = link;
    try {
      if (/^https?:\/\//i.test(link)) {
        const url = new URL(link);
        path = url.pathname + url.search;
      }
    } catch {
      // keep raw link on parse failure
    }
    path = path.replace(/^\/[a-z]{2}(?=\/|$)/i, '');
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    this.router.navigateByUrl(`/${language}${path}`);
    this.moreMenuOpen = false;
    this.toggleMenuOpened(false);
    this.toggleMobileNav(false);
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

    const currentFilter = this.normalizeText(this.qpService.getParamValue('filter') || '');
    if (!currentFilter || !this.isActiveNav('/products')) {
      return false;
    }

    // For admin menu links, compare the link's own filter= param to the active one.
    if (link.type === 'link' && link.link) {
      const linkFilter = this.normalizeText(decodeURIComponent((link.link.match(/[?&]filter=([^&]*)/)?.[1]) || ''));
      return !!linkFilter && currentFilter === linkFilter;
    }

    return currentFilter.includes(this.normalizeText(link.label));
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

    // Desktop nav + mobile drawer entries come from the admin menus (site_config
    // config_type=desktop_menu / drawer_menu). Rebuilt here so labels follow language.
    this.buildDesktopMenuNav();
    this.buildDrawerMenuNav();

    this.staticNavLinks = [
      {label: language === 'ru' ? 'Блог' : language === 'en' ? 'Blog' : 'Blog', path: '/blog', icon: 'book'},
      {label: language === 'ru' ? 'Наши проекты' : language === 'en' ? 'Our Projects' : 'Proiectele Noastre', path: '/proiecte', icon: 'image'},
      {label: language === 'ru' ? 'Контакты' : language === 'en' ? 'Contacts' : 'Contacte', path: '/contacts', icon: 'phone'}
    ];
  }

  // Load the admin-configured menus from site_config in one fetch: the desktop
  // top bar (config_type=desktop_menu) and the mobile drawer (config_type=drawer_menu).
  // Both are lists of active entries ordered by order_index, each with a pre-built link.
  private loadMenus() {
    this.publicService.getSiteConfig({rowsPerPage: 200}).pipe(
      catchError(() => of({data: []})),
      takeUntilDestroyed(this.destroy)
    ).subscribe((res: any) => {
      this.desktopMenuRaw = this.extractMenu(res?.data, 'desktop_menu');
      this.drawerMenuRaw = this.extractMenu(res?.data, 'drawer_menu');
      this.buildDesktopMenuNav();
      this.buildDrawerMenuNav();
      this.cdr.detectChanges();
    });
  }

  private extractMenu(rows: any[], configType: string) {
    return (rows || [])
      .filter((row: any) => findObjectByKey(row.data, 'config_type') === configType
        && findObjectByKey(row.data, 'is_active') !== false)
      .map((row: any) => ({
        label: findObjectByKey(row.data, 'label'),
        link: findObjectByKey(row.data, 'link') || '',
        order: findObjectByKey(row.data, 'order_index') ?? 0,
        icon: findObjectByKey(row.data, 'icon') || ''
      }))
      .sort((a: any, b: any) => a.order - b.order);
  }

  // Split the desktop-menu entries into the inline row + "More" overflow, with
  // labels localized to the active language.
  private buildDesktopMenuNav() {
    const links: TopNavLink[] = (this.desktopMenuRaw || [])
      .filter((e) => e.link)
      .map((e) => ({label: this.getLocalizedLabel(e.label), type: 'link' as const, link: e.link}));

    this.topNavLinks = links.slice(0, this.MAX_FLAT_NAV);
    this.overflowNavLinks = links.slice(this.MAX_FLAT_NAV);
  }

  // Mobile drawer entries (config_type=drawer_menu), localized to the active language,
  // carrying the admin-configured icon name (lucide: hexagon/puzzle/square/layers…).
  private buildDrawerMenuNav() {
    this.drawerMenuLinks = (this.drawerMenuRaw || [])
      .filter((e) => e.link)
      .map((e) => ({label: this.getLocalizedLabel(e.label), type: 'link' as const, link: e.link, icon: e.icon}));
  }

  toggleMoreMenu(open?: boolean) {
    this.moreMenuOpen = open ?? !this.moreMenuOpen;
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
