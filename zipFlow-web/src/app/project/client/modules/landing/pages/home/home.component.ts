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
  mapUrl = 'https://www.google.com/maps/place/Gheorghe+Madan+Strada,+Chi%C8%99in%C4%83u,+Moldova/@47.0607145,28.8417865,17z';
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
      mapButton: 'HARTĂ INTERACTIVĂ',
      designerTitle: 'Pentru Designeri',
      designerNote: 'Număr de contact — în curând disponibil',
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
      designerNote: 'Контактный номер — скоро будет доступен',
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
      mapButton: 'INTERACTIVE MAP',
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
    // Embedded company-location map (was never assigned → the section always fell
    // back to the static placeholder image).
    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.google.com/maps?q=46.9878428,28.8349773&z=17&output=embed'
    );
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

  navigateToProducts(filterParam?: string) {
    const queryParams: any = {
      sortBy: 'created_at',
      sortOrder: 'DESC',
      page: 1,
      rowsPerPage: 12,
    };
    if (filterParam) {
      queryParams.filter = filterParam;
    }
    this.router.navigate([`/${this.getLanguage()}/products`], {queryParams});
  }

  navigateToCategory(card: CategoryCard) {
    if (card.link) {
      try {
        const url = new URL(card.link);
        this.router.navigateByUrl(url.pathname + url.search);
      } catch {
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

  onHeroImageLoad() {
    this.heroImageLoaded = true;
    this.cdr.detectChanges();
  }

  navigateToLink(link: string) {
    if (!link) return;
    try {
      const url = new URL(link);
      this.router.navigateByUrl(url.pathname + url.search);
    } catch {
      this.router.navigateByUrl(link);
    }
  }

  private loadHomepageData() {
    this.loading = true;

    forkJoin([
      this.publicService.getProductCategories({filter: 'main_contains_true'}).pipe(catchError(() => of({data: []}))),
      this.publicService.getProducts({page: 1, rowsPerPage: 4, filter: 'has_sale_contains_true', sortBy: 'updated_at', sortOrder: 'DESC'}).pipe(catchError(() => of({data: []}))),
      this.publicService.getGeneralDetails().pipe(catchError(() => of({data: []}))),
      this.publicService.getSiteConfig({page: 1, rowsPerPage: 100}).pipe(catchError(() => of({data: []}))),
      this.publicService.getAddresses({page: 1, rowsPerPage: 100, sortBy: 'created_at', sortOrder: 'ASC'}).pipe(catchError(() => of({data: []})))
    ]).pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(([categories, offers, general, siteConfig, addresses]) => {
      this.buildCategoryCards(siteConfig?.data || [], categories?.data || []);
      this.buildOfferCards(offers?.data || []);
      this.buildAddresses(addresses?.data || []);
      this.buildDesignerPhones(siteConfig?.data || []);
      this.buildHeroAndBanners(siteConfig?.data || []);
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private buildCategoryCards(siteConfig: any[], categories: any[]) {
    // Homepage category cards are driven explicitly by the admin Site Config
    // "Homepage Categories" tab (config_type === 'homepage_category'), NOT by the
    // product-category entity. Only fall back to product categories if no config exists.
    const homepageCategoryConfigs = (siteConfig || [])
      .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'homepage_category')
      .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false)
      .sort((a: any, b: any) =>
        Number(findObjectByKey(a.data, 'order_index') || 999) - Number(findObjectByKey(b.data, 'order_index') || 999));

    if (homepageCategoryConfigs.length) {
      this.categoryCards = homepageCategoryConfigs.map((item: any) => {
        const label = findObjectByKey(item.data, 'label');
        const link = findObjectByKey(item.data, 'link') || '';
        const image = findObjectByKey(item.data, 'image');
        const rawTags = findObjectByKey(item.data, 'tags');
        const tags = Array.isArray(rawTags)
          ? rawTags.map((t: any) => (typeof t === 'object' ? (t?.[this.currentLanguage] || t?.['ro'] || '') : (t || ''))).filter(Boolean)
          : [];
        return {
          title: typeof label === 'object' ? (label?.[this.currentLanguage] || label?.['ro'] || '') : (label || ''),
          tags,
          image: Array.isArray(image) ? image[0]?.file_url : (image || 'assets/images/placeholder.png'),
          filter: typeof label === 'object' ? (label?.['ro'] || label?.[this.currentLanguage] || String(item.id)) : (label || String(item.id)),
          filterType: 'category' as const,
          categoryId: item.id,
          action: this.ui.catalogCta,
          link
        };
      });
      return;
    }

    // Fallback: derive cards from product categories when no homepage_category config is set.
    this.categoryCards = (categories || []).map((cat: any) => {
      const label = findObjectByKey(cat.data, 'label');
      const image = findObjectByKey(cat.data, 'image');
      const slug = findObjectByKey(cat.data, 'slug');
      const link = findObjectByKey(cat.data, 'link');
      return {
        title: typeof label === 'object' ? (label?.[this.currentLanguage] || label?.['ro'] || '') : (label || ''),
        tags: [],
        image: Array.isArray(image) ? image[0]?.file_url : (image || 'assets/images/placeholder.png'),
        filter: typeof slug === 'object' ? (slug?.['ro'] || slug?.[this.currentLanguage] || String(cat.id)) : (slug || String(cat.id)),
        filterType: 'category' as const,
        categoryId: cat.id,
        action: this.ui.offersAll,
        link: link || ''
      };
    });
  }

  private buildOfferCards(products: any[]) {
    this.offerCards = (products || []).map((prod: any) => {
      const title = findObjectByKey(prod.data, 'title');
      const images = findObjectByKey(prod.data, 'images');
      const configs = findObjectByKey(prod.data, 'configurations');
      const config = configs?.[0]?.configuration?.[0];
      const price = parseFloat(config?.price?.[0]?.value) || 0;
      const oldPrice = parseFloat(config?.old_price?.[0]?.value) || price;
      const discount = oldPrice > price ? `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%` : '';

      return {
        id: prod.id,
        title: typeof title === 'object' ? (title?.[this.currentLanguage] || title?.['ro'] || '') : (title || ''),
        oldPrice: oldPrice !== price ? `${oldPrice} ${config?.price?.[0]?.currency || 'lei'}` : '',
        price: `${price} ${config?.price?.[0]?.currency || 'lei'}`,
        discount,
        image: Array.isArray(images) ? images[0]?.file_url : 'assets/images/placeholder.png',
        model: findObjectByKey(prod.data, 'model') || '',
        size: config?.size || '',
        sku: findObjectByKey(prod.data, 'sku') || '',
        characteristic: '',
        rawPrice: price,
        rawOldPrice: oldPrice
      };
    });
  }

  private buildAddresses(addresses: any[]) {
    this.addresses = (addresses || []).map((addr: any) => {
      const name = findObjectByKey(addr.data, 'name') || findObjectByKey(addr.data, 'label');
      const street = findObjectByKey(addr.data, 'street') || findObjectByKey(addr.data, 'address');
      const phone = findObjectByKey(addr.data, 'phone') || findObjectByKey(addr.data, 'main_phone');
      const email = findObjectByKey(addr.data, 'email') || findObjectByKey(addr.data, 'main_email');
      const mapUrl = findObjectByKey(addr.data, 'map_url') || findObjectByKey(addr.data, 'map');
      const scheduleRaw = findObjectByKey(addr.data, 'schedule');
      const scheduleStr = typeof scheduleRaw === 'object' ? (scheduleRaw?.[this.currentLanguage] || scheduleRaw?.['ro'] || '') : (scheduleRaw || '');
      return {
        name: typeof name === 'object' ? (name?.[this.currentLanguage] || name?.['ro'] || '') : (name || ''),
        street: typeof street === 'object' ? (street?.[this.currentLanguage] || street?.['ro'] || '') : (street || ''),
        phone: phone || '',
        email: email || '',
        schedule: scheduleStr ? scheduleStr.split('|').map((s: string) => s.trim()).filter(Boolean) : [],
        mapUrl: mapUrl || ''
      };
    });
  }

  private buildDesignerPhones(siteConfig: any[]) {
    // Designer contacts are their own Site Config tab (config_type ===
    // 'designer_phones'), one entry per designer: `label` is the name and `link`
    // holds the phone number.
    this.designerPhones = (siteConfig || [])
      .filter((item: any) => findObjectByKey(item.data, 'config_type') === 'designer_phones')
      .filter((item: any) => findObjectByKey(item.data, 'is_active') !== false)
      .sort((a: any, b: any) =>
        Number(findObjectByKey(a.data, 'order_index') || 999) - Number(findObjectByKey(b.data, 'order_index') || 999))
      .map((item: any) => {
        const label = findObjectByKey(item.data, 'label');
        return {
          name: typeof label === 'object' ? (label?.[this.currentLanguage] || label?.['ro'] || '') : (label || ''),
          phone: findObjectByKey(item.data, 'link') || ''
        };
      })
      .filter((d: any) => d.phone);
  }

  private buildHeroAndBanners(siteConfig: any[]) {
    const heroItems = (siteConfig || []).filter((item: any) => findObjectByKey(item.data, 'config_type') === 'hero_banner');
    const sorted = heroItems.sort((a: any, b: any) => {
      const orderA = Number(findObjectByKey(a.data, 'order_index') || 999);
      const orderB = Number(findObjectByKey(b.data, 'order_index') || 999);
      return orderA - orderB;
    });

    if (sorted.length > 0) {
      const hero = sorted[0];
      const heroLabel = findObjectByKey(hero.data, 'label');
      this.heroTitle = typeof heroLabel === 'object' ? (heroLabel?.[this.currentLanguage] || heroLabel?.['ro'] || '') : (heroLabel || '');
      const heroImage = findObjectByKey(hero.data, 'image');
      this.heroImageUrl = Array.isArray(heroImage) ? heroImage[0]?.file_url : (heroImage || '');
      this.heroButtonLink = findObjectByKey(hero.data, 'link') || '';
    }

    this.promoBanners = sorted.slice(1).map((item: any) => {
      const label = findObjectByKey(item.data, 'label');
      const image = findObjectByKey(item.data, 'image');
      return {
        title: typeof label === 'object' ? (label?.[this.currentLanguage] || label?.['ro'] || '') : (label || ''),
        image: Array.isArray(image) ? image[0]?.file_url : (image || 'assets/images/placeholder.png'),
        link: findObjectByKey(item.data, 'link') || ''
      };
    });
  }

  private getLanguage(): string {
    if (typeof localStorage === 'undefined') return 'ro';
    return (localStorage.getItem('language') || 'ro').toLowerCase();
  }
}
