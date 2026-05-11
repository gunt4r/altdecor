import {ChangeDetectorRef, Component, DestroyRef, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {NavigationEnd, Router} from "@angular/router";
import {MetaService} from "../../../shared/services/meta.service";
import {PublicService} from "../../../shared/services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {catchError, filter, forkJoin, of} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CartProductService} from "../../../shared/services/cart-products.service";

type CategoryCard = {
  title: string;
  tags: string[];
  image: string;
  filter: string;
  filterType: 'category' | 'type';
  categoryId?: string | number;
  action: string;
  link?: string;
};

type OfferCard = {
  id: string | number;
  title: string;
  oldPrice: string;
  price: string;
  discount: string;
  image: string;
  model: string;
  size: string;
  sku: string;
  characteristic: string;
  rawPrice: string | number;
  rawOldPrice: string | number;
};

type AddressItem = {
  name: string;
  street: string;
  phone: string;
  email: string;
  schedule: string[];
  mapUrl: string;
};

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categoryCards: CategoryCard[] = [];
  offerCards: OfferCard[] = [];
  addresses: AddressItem[] = [];
  designerPhones: {name: string, phone: string}[] = [];
  mapEmbedUrl: SafeResourceUrl | null = null;
  heroImageUrl = '';
  heroTitle = '';
  heroButtonLink = '';
  loading = true;
  heroImageLoaded = false;
  promoBanners: Array<{image: string; link: string; title: string}> = [];
  mapUrl = 'https://www.google.com/maps/place/Gheorghe+Madan+Strada,+Chi%C8%99in%C4%83u,+Moldova/@47.0607145,28.8417865,17z/data=!3m1!4b1!4m6!3m5!1s0x40c97d104d43b385:0x33b52c5d28105ac3!8m2!3d47.0607145!4d28.8443614!16s%2Fg%2F11cly7c_gh?entry=ttu';
  currentLanguage = 'ro';

  readonly uiByLanguage: Record<string, any> = {
    ro: {
      heroTitle: 'Experți în panouri decorative pentru spații moderne',
      catalogCta: 'Explorează catalogul',
      categoriesTitle: 'Categorii',
      offersTitle: 'Oferte Speciale',
      offersAll: 'Vezi toate ofertele',
      contactsTitle: 'Contacte',
      allAddresses: 'TOATE ADRESELE',
      mapButton: 'INTERACTIVE MAP MODULE',
      designerTitle: 'Pentru Designeri',
      designerNote: 'Număr de contact  — în curând disponibil',
      addToCart: 'Adaugă',
      heroStats: [
        {title: 'Cel Mai Mare Magazin', subtitle: 'O gamă vastă de expuneri vizuale'},
        {title: 'Stoc Permanent', subtitle: 'Mii de metri pătrați disponibili imediat.'},
        {title: 'Achitare în Rate', subtitle: 'Fără dobândă, flexibilitate maximă.'}
      ]
    },
    ru: {
      heroTitle: 'Эксперты по декоративным панелям для современных пространств',
      catalogCta: 'Смотреть каталог',
      categoriesTitle: 'Категории',
      offersTitle: 'Специальные предложения',
      offersAll: 'Смотреть все предложения',
      contactsTitle: 'Контакты',
      allAddresses: 'ВСЕ АДРЕСА',
      mapButton: 'ИНТЕРАКТИВНАЯ КАРТА',
      designerTitle: 'Для Дизайнеров',
      designerNote: 'Контактный номер  — скоро будет доступен',
      addToCart: 'Добавить',
      heroStats: [
        {title: 'Самый Большой Магазин', subtitle: 'Широкий выбор визуальных экспозиций'},
        {title: 'Постоянный Склад', subtitle: 'Тысячи квадратных метров доступны сразу.'},
        {title: 'Оплата в Рассрочку', subtitle: 'Без процентов, максимальная гибкость.'}
      ]
    },
    en: {
      heroTitle: 'Experts in Decorative Panels for Modern Spaces',
      catalogCta: 'Explore the Catalog',
      categoriesTitle: 'Categories',
      offersTitle: 'Special Offers',
      offersAll: 'View all offers',
      contactsTitle: 'Contacts',
      allAddresses: 'ALL ADDRESSES',
      mapButton: 'INTERACTIVE MAP MODULE',
      designerTitle: 'For Designers',
      designerNote: 'Contact number — coming soon',
      addToCart: 'Add',
      heroStats: [
        {title: 'Largest Store', subtitle: 'A vast range of visual displays'},
        {title: 'Permanent Stock', subtitle: 'Thousands of square meters available immediately.'},
        {title: 'Installment Payment', subtitle: 'No interest, maximum flexibility.'}
      ]
    },
  };

  get ui() {
    return this.uiByLanguage[this.currentLanguage] || this.uiByLanguage['ro'];
  }

  get heroStats() {
    return this.ui.heroStats;
  }

  constructor(private meta: MetaService,
              private router: Router,
              private publicService: PublicService,
              private cartService: CartProductService,
              private cdr: ChangeDetectorRef,
              private destroy: DestroyRef,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.currentLanguage = this.getLanguage();
    this.meta.getMeta(this.router.url);
    this.loadHomepageData();

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroy)
    ).subscribe(() => {
      const language = this.getLanguage();
      if (language !== this.currentLanguage) {
        this.currentLanguage = language;
        this.loadHomepageData();
      }
    });
  }

  navigateToProducts(filter?: string) {
    const queryParams: any = {
      sortBy: 'created_at',
      sortOrder: 'DESC',
      page: 1,
      rowsPerPage: 12,
    };

    if (filter) {
      queryParams.filter = filter;
    }

    this.router.navigate([`/${this.getLanguage()}/products`], {queryParams});
  }

  navigateToCategory(card: CategoryCard) {
    if (card.link) {
      const lang = this.getLanguage();
      if (card.link.includes('?')) {
        const [path, qs] = card.link.split('?');
        const queryParams: any = {};
        qs.split('&').forEach(pair => {
          const [k, v] = pair.split('=');
          if (k && v) queryParams[decodeURIComponent(k)] = decodeURIComponent(v);
        });
        this.router.navigate([`/${lang}${path}`], {queryParams});
      } else {
        this.router.navigate([`/${lang}${card.link}`]);
      }
      return;
    }
    this.navigateToProducts(`${card.filterType === 'type' ? 'product_type_contains_' : 'product_category_contains_'}${card.filter}`);
  }

  navigateToOfferDetails(offerId: string | number) {
    this.router.navigate([`/${this.getLanguage()}/products/${offerId}`]);
  }

  openAllOffers() {
    this.navigateToProducts('has_sale_contains_true');
  }

  addOfferToCart(offer: OfferCard) {
    this.cartService.addProductToCart({
      id: offer.id,
      img: offer.image,
      name: offer.title,
      price: offer.rawPrice,
      oldPrice: offer.rawOldPrice,
      model: offer.model,
      quantity: 1,
      size: offer.size,
      sku: offer.sku,
      characteristic: offer.characteristic
    });
  }

  openMap(url?: string) {
    if (typeof window !== 'undefined') {
      window.open(url || this.mapUrl, '_blank');
    }
  }

  onHeroImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    // Only fade in if this is the current hero image (not a stale load)
    if (img.src && img.src.includes(this.heroImageUrl)) {
      this.heroImageLoaded = true;
      this.cdr.detectChanges();
    }
  }

  navigateToLink(link: string) {
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      this.router.navigateByUrl(link);
    }
  }

  private loadHomepageData() {
    this.loading = true;
    this.heroImageLoaded = false;
    forkJoin([
      this.publicService.getCategoriesBanner().pipe(catchError(() => of({data: []}))),
      this.publicService.getProductCategories({filter: 'main_contains_true'}).pipe(catchError(() => of({data: []}))),
      this.publicService.getProductTypes({page: 1, rowsPerPage: 1000}).pipe(catchError(() => of({data: []}))),
      this.publicService.getProducts({page: 1, rowsPerPage: 4, filter: 'has_sale_contains_true', sortBy: 'updated_at', sortOrder: 'DESC'}).pipe(catchError(() => of({data: []}))),
      this.publicService.getGeneralDetails().pipe(catchError(() => of({data: []}))),
      this.publicService.getSiteConfig({page: 1, rowsPerPage: 100}).pipe(catchError(() => of({data: []}))),
      this.publicService.getAddresses({page: 1, rowsPerPage: 100, sortBy: 'created_at', sortOrder: 'ASC'}).pipe(catchError(() => of({data: []})))
    ]).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: ([bannerResponse, categoriesResponse, productTypesResponse, productsResponse, detailsResponse, siteConfigResponse, addressResponse]) => {
        const banners = bannerResponse?.data || [];
        const allProductTypes = productTypesResponse?.data || [];
        const siteConfigItems = siteConfigResponse?.data || [];

        // Build categories from site_config homepage_category items
        const homepageCategoryConfigs = siteConfigItems
          .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'homepage_category')
          .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false)
          .sort((a: any, b: any) => (findObjectByKey(a.data, 'order_index') || 0) - (findObjectByKey(b.data, 'order_index') || 0));

        if (homepageCategoryConfigs.length) {
          this.categoryCards = homepageCategoryConfigs.map((item: any) => {
            const label = this.resolveLocalizedText(findObjectByKey(item.data, 'label'));
            const link = findObjectByKey(item.data, 'link') || '';
            const imageVal = findObjectByKey(item.data, 'image');
            const image = typeof imageVal === 'string' && imageVal
              ? imageVal
              : (Array.isArray(imageVal) && imageVal.length) ? (imageVal[0]?.file_url || imageVal[0]) : '';

            // Find matching banner for fallback image
            const matchedBanner = banners.find((banner: any) => {
              const bannerTitle = this.resolveLocalizedText(findObjectByKey(banner.data, 'title'));
              return this.normalizeText(bannerTitle).includes(this.normalizeText(label))
                || this.normalizeText(label).includes(this.normalizeText(bannerTitle));
            });
            const fallbackImage = findObjectByKey(matchedBanner?.data, 'bg_img')?.[0]?.['file_url'] || 'assets/images/content/panels.png';

            const adminTags = findObjectByKey(item.data, 'tags');
            const tags = (Array.isArray(adminTags) && adminTags.length)
              ? adminTags.map((t: any) => this.resolveLocalizedText(t)).filter(Boolean)
              : this.buildCategoryTagsFromData(label, allProductTypes);

            return {
              title: label,
              tags,
              image: image || fallbackImage,
              filter: label,
              filterType: 'category' as const,
              categoryId: item.id,
              action: this.ui.catalogCta,
              link
            };
          });
        } else {
          // Fallback: use product categories from DB
          const mainCategories = (categoriesResponse?.data || []).slice(0, 6);
          if (mainCategories.length) {
            this.categoryCards = mainCategories.map((category: any, index: number) => {
              const localizedLabel = this.resolveLocalizedText(findObjectByKey(category.data, 'label'));
              const matchedBanner = banners.find((banner: any) => {
                const bannerTitle = this.resolveLocalizedText(findObjectByKey(banner.data, 'title'));
                return this.normalizeText(bannerTitle).includes(this.normalizeText(localizedLabel))
                  || this.normalizeText(localizedLabel).includes(this.normalizeText(bannerTitle));
              }) || banners[index];
              const tags = this.buildCategoryTagsFromData(localizedLabel, allProductTypes);

              return {
                title: localizedLabel,
                tags,
                image: findObjectByKey(matchedBanner?.data, 'bg_img')?.[0]?.['file_url'] || 'assets/images/content/panels.png',
                filter: localizedLabel,
                filterType: 'category' as const,
                categoryId: category.id || index,
                action: this.ui.catalogCta
              };
            });
          }
        }

        // Offers: max 4 has_sale products sorted by updated_at
        this.offerCards = (productsResponse?.data || []).slice(0, 4).map((product: any) => {
          const configurations = findObjectByKey(product.data, 'configurations') || [];
          const mainConfiguration = configurations?.[0]?.configuration?.[0] || {};
          const currentPrice = mainConfiguration?.price?.[0];
          const oldPrice = mainConfiguration?.old_price?.[0];
          const rawCurrentPrice = currentPrice?.value || '';
          const rawOldPrice = oldPrice?.value || '';

          return {
            id: product.id,
            title: this.resolveLocalizedText(findObjectByKey(product.data, 'title')) || 'Produs',
            oldPrice: oldPrice ? `${oldPrice.value} ${oldPrice.currency}` : '',
            price: currentPrice ? `${currentPrice.value} ${currentPrice.currency}` : '',
            discount: this.getDiscountLabel(rawOldPrice, rawCurrentPrice),
            image: findObjectByKey(product.data, 'images')?.[0]?.file_url || 'assets/images/content/product.png',
            model: this.resolveLocalizedText(findObjectByKey(product.data, 'model')),
            size: 'STANDARD',
            sku: this.resolveLocalizedText(findObjectByKey(product.data, 'sku')),
            characteristic: this.resolveLocalizedText(findObjectByKey(product.data, 'characteristic')),
            rawPrice: rawCurrentPrice,
            rawOldPrice: rawOldPrice
          };
        });

        // Load addresses from address entity
        const addressItems = addressResponse?.data || [];
        this.addresses = addressItems
          .filter((addr: any) => findObjectByKey(addr.data, 'is_active') !== false)
          .sort((a: any, b: any) => (findObjectByKey(a.data, 'order_index') || 0) - (findObjectByKey(b.data, 'order_index') || 0))
          .map((addr: any) => {
            const scheduleRaw = this.resolveLocalizedText(findObjectByKey(addr.data, 'schedule'));
            return {
              name: this.resolveLocalizedText(findObjectByKey(addr.data, 'name')),
              street: this.resolveLocalizedText(findObjectByKey(addr.data, 'street')),
              phone: findObjectByKey(addr.data, 'phone') || '',
              email: findObjectByKey(addr.data, 'email') || '',
              schedule: scheduleRaw ? scheduleRaw.split('|').map((s: string) => s.trim()).filter(Boolean) : [],
              mapUrl: findObjectByKey(addr.data, 'map_url') || ''
            };
          });

        // Build Google Maps embed URL from first address (priority by order_index)
        const firstWithMap = this.addresses.find(a => a.mapUrl) || this.addresses[0];
        if (firstWithMap) {
          let query = firstWithMap.street || '';
          if (firstWithMap.mapUrl) {
            const placeMatch = firstWithMap.mapUrl.match(/place\/([^/]+)/);
            const qMatch = firstWithMap.mapUrl.match(/[?&]q=([^&]+)/);
            if (placeMatch) {
              query = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
            } else if (qMatch) {
              query = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
            }
          }
          if (query) {
            this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(query)}`
            );
          }
        }

        // Load designer phones from site_config
        const designerPhoneConfigs = siteConfigItems
          .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'designer_phones')
          .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false)
          .sort((a: any, b: any) => (findObjectByKey(a.data, 'order_index') || 0) - (findObjectByKey(b.data, 'order_index') || 0));
        this.designerPhones = designerPhoneConfigs
          .map((item: any) => ({
            name: this.resolveLocalizedText(findObjectByKey(item.data, 'label')) || '',
            phone: findObjectByKey(item.data, 'link') || ''
          }))
          .filter((d: any) => d.phone);

        // Load hero banner from site_config (priority)
        const heroBannerConfigs = siteConfigItems
          .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'hero_banner')
          .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false)
          .sort((a: any, b: any) => (findObjectByKey(a.data, 'order_index') || 0) - (findObjectByKey(b.data, 'order_index') || 0));

        if (heroBannerConfigs.length) {
          const heroConfig = heroBannerConfigs[0]; // First active = hero
          const heroLabel = findObjectByKey(heroConfig.data, 'label');
          if (heroLabel) {
            const resolvedTitle = this.resolveLocalizedText(heroLabel);
            if (resolvedTitle) {
              this.heroTitle = resolvedTitle;
            }
          }
          const heroLink = findObjectByKey(heroConfig.data, 'link');
          if (heroLink) {
            this.heroButtonLink = heroLink;
          }
          const heroImage = findObjectByKey(heroConfig.data, 'image');
          if (typeof heroImage === 'string' && heroImage) {
            this.heroImageUrl = heroImage;
          } else if (!this.heroImageUrl) {
            this.heroImageUrl = 'assets/images/content/hero.png';
          }

          // Additional banners (2nd, 3rd, etc.) become promo banners below hero
          this.promoBanners = heroBannerConfigs.slice(1).map((cfg: any) => ({
            image: findObjectByKey(cfg.data, 'image') || '',
            link: findObjectByKey(cfg.data, 'link') || '',
            title: this.resolveLocalizedText(findObjectByKey(cfg.data, 'label')) || ''
          })).filter((b: any) => b.image);
        } else {
          // Fallback: Hero image from general_details
          const detailsData = detailsResponse?.data?.[0]?.data;
          if (detailsData) {
            const heroImg = findObjectByKey(detailsData, 'hero_image');
            if (heroImg?.[0]?.file_url) {
              this.heroImageUrl = heroImg[0].file_url;
            }
          }
          if (!this.heroImageUrl) {
            this.heroImageUrl = 'assets/images/content/hero.png';
          }
        }

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildCategoryTagsFromData(categoryLabel: string, allProductTypes: any[]): string[] {
    const normalized = this.normalizeText(categoryLabel);

    for (const type of allProductTypes) {
      const typeLabel = this.normalizeText(this.resolveLocalizedText(findObjectByKey(type.data, 'label')));
      if (typeLabel.includes(normalized) || normalized.includes(typeLabel)) {
        const subcategories = findObjectByKey(type.data, 'categories') || [];
        const tags = subcategories.slice(0, 4).map((cat: any) =>
          this.resolveLocalizedText(cat?.value?.label || cat?.label)
        ).filter(Boolean);

        if (tags.length) {
          return tags;
        }
      }
    }

    return this.buildCategoryTags(categoryLabel);
  }

  private buildCategoryTags(title: string): string[] {
    const normalized = title.toLowerCase();
    if (normalized.includes('perete')) return ['Panouri PVC', 'Panouri SPC', 'Panouri Poliuretan', 'Autocolante'];
    if (normalized.includes('podea')) return ['Autocolante', 'Panouri SPC', 'Panouri Poliuretan'];
    if (normalized.includes('tavan')) return ['Panouri Bambus 5mm'];
    if (normalized.includes('plinte')) return ['Plinte pentru podea', 'Plinte pentru tavan', 'Plinte ascunse', 'Plinte flexibile'];
    if (normalized.includes('adeziv')) return ['Interior', 'Exterior', 'Fixare rapidă'];
    if (normalized.includes('profile')) return ['Profile pentru pardoseală', 'Profile pentru pereți', 'Profile pentru grăsie', 'Profile pentru LED'];
    return ['Categorie'];
  }

  private resolveLocalizedText(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const language = this.getLanguage();
    return value[language] || value['ro'] || (Object.values(value)[0] as string) || '';
  }

  private getDiscountLabel(oldPrice: string | number, currentPrice: string | number): string {
    const oldValue = Number(oldPrice);
    const currentValue = Number(currentPrice);
    if (!oldValue || !currentValue || currentValue >= oldValue) return '-20%';
    const discount = Math.round(((oldValue - currentValue) / oldValue) * 100);
    return `-${discount}%`;
  }

  private getLanguage(): string {
    if (typeof localStorage === 'undefined') return 'ro';
    return (localStorage.getItem('language') || 'ro').toLowerCase();
  }

  private normalizeText(value: string): string {
    return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }
}
