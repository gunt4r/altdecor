import {ChangeDetectorRef, Component, HostListener, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {isPlatformBrowser} from "@angular/common";
import {PageSlug} from "../../shared/components/page-container/pages.type";
import {Router} from "@angular/router";
import {PublicService} from "../../shared/services/public.service";
import {TranslateService} from "../../shared/services/translate.service";
import {findObjectByKey} from "../../../../../theme/shared/utils/form.utils";

interface MenuItem {
  LABEL: string;
  LINK: string;
  FRAGMENT?: string;
}

interface MenuSection {
  [key: string]: MenuItem;
}

interface Menu {
  [section: string]: MenuSection;
}

interface SocialMediaItem {
  IMG: string;
  LINK: string;
  ALT: string;
}

interface SocialMedia {
  [platform: string]: SocialMediaItem;
}

interface Data {
  SOCIAL_MEDIA: SocialMedia;
  MENU: Menu;
  POWERED_BY: string;
  COPYRIGHT_OWNER: string;
  COPYRIGHT: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  menuColumns: string[] = [];
  socialMediaKeys: string[] = [];
  currentYear: number = new Date().getFullYear();
  isMobile: boolean = false;
  generalDetails: any = {};

  data: Data = {
    "SOCIAL_MEDIA": {
      // "FB": {
      //   "IMG": "assets/images/content/facebook-logo.svg",
      //   "LINK": "",
      //   "ALT": "Facebook logo"
      // },
      // "PINTEREST": {
      //   "IMG": "assets/images/content/pinterest-logo.svg",
      //   "LINK": "",
      //   "ALT": "Pinterest logo"
      // },
      "INSTAGRAM": {
        "IMG": "assets/images/content/instagram-logo.svg",
        "LINK": "https://www.instagram.com/altdecor.moldova?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D",
        "ALT": "Instagram logo"
      },
      "TIKTOK": {
        "IMG": "assets/images/content/tiktok.svg",
        "LINK": "https://www.tiktok.com/@altdecor.md?is_from_webapp=1&sender_device=pc",
        "ALT": "TikTok logo"
      }
    },
    "MENU": {
      "Home": {
        "SHOP_NOW": {
          "LABEL": "Footer.Menu.Home.Shop",
          "LINK": PageSlug.Products
        },
        "ABOUT_US": {
          "LABEL": "Footer.Menu.Home.AboutUs",
          "LINK": PageSlug.AboutUs
        },
        "PORTFOLIO": {
          "LABEL": "Footer.Menu.Home.Portfolio",
          "LINK": PageSlug.Portfolio
        },
        "GALLERY": {
          "LABEL": "Footer.Menu.Home.Gallery",
          "LINK": PageSlug.Proiecte
        },
        "BLOG": {
          "LABEL": "Footer.Menu.Home.Blog",
          "LINK": PageSlug.Blog
        },
        "FAQ": {
          "LABEL": "Footer.Menu.Home.FAQ",
          "LINK": PageSlug.Faq
        },
        "CONTACT_US": {
          "LABEL": "Footer.Menu.Home.ContactUs",
          "LINK": PageSlug.Contacts
        }
      },
      "Collections": {},
      "Legal": {
        "CONFIDENTIALITATE": {
          "LABEL": "Footer.Menu.Legal.Confidentialitate",
          "LINK": ""
        },
        "RETUR": {
          "LABEL": "Footer.Menu.Legal.Retur",
          "LINK": "/assets/documents/Politica de Retur.pdf"
        },
        "PLATA_LIVRARE": {
          "LABEL": "Footer.Menu.Legal.Livrare",
          "LINK": ""
        },
        "TERMENI_CONDITII": {
          "LABEL": "Footer.Menu.Legal.Termeni",
          "LINK": ""
        }
      }
    },
    "POWERED_BY": "Powered by NAQQA",
    "COPYRIGHT_OWNER": "Gardecor",
    "COPYRIGHT": "© Copyright, "
  };

  mapUrl = 'https://www.google.com/maps/place/Gheorghe+Madan+Strada,+Chi%C8%99in%C4%83u,+Moldova/@47.0607145,28.8417865,17z/data=!3m1!4b1!4m6!3m5!1s0x40c97d104d43b385:0x33b52c5d28105ac3!8m2!3d47.0607145!4d28.8443614!16s%2Fg%2F11cly7c_gh?entry=ttu';
  languages: any[] = [];
  selectedLanguage: string = localStorage.getItem('language') || 'ro';

  // ---- Footer content (matches production layout) ----
  description: Record<string, string> = {
    ro: 'Experți în panouri decorative pentru spații moderne',
    ru: 'Эксперты по декоративным панелям для современных пространств',
    en: 'Experts in decorative panels for modern spaces'
  };

  rightsText: Record<string, string> = {
    ro: 'Toate drepturile rezervate. Prețurile pot fi modificate.',
    ru: 'Все права защищены. Цены могут быть изменены.',
    en: 'All rights reserved. Prices subject to change.'
  };

  columnTitles = {
    magazine: {ro: 'Magazine', ru: 'Магазины', en: 'Stores'},
    produse: {ro: 'Produse', ru: 'Продукты', en: 'Products'},
    info: {ro: 'Informații', ru: 'Информация', en: 'Information'}
  };

  showrooms: { name: string; address: string }[] = [];

  produseLinks = [
    {label: {ro: 'Panou decorativ INTERIOR', ru: 'Декоративная панель ИНТЕРЬЕР', en: 'Decorative panel INTERIOR'}, link: '/products?filter=product_type_contains_Panou decorativ INTERIOR'},
    {label: {ro: 'Panou decorativ EXTERIOR', ru: 'Декоративная панель ЭКСТЕРЬЕР', en: 'Decorative panel EXTERIOR'}, link: '/products?filter=product_type_contains_Panou decorativ EXTERIOR'},
    {label: {ro: 'Profil decorativ', ru: 'Декоративный профиль', en: 'Decorative profile'}, link: '/products?filter=product_type_contains_Profil decorativ'},
    {label: {ro: 'Panou Autoadeziv', ru: 'Самоклеящаяся панель', en: 'Self-adhesive panel'}, link: '/products?filter=product_type_contains_Panou Autoadeziv'},
    {label: {ro: 'Răcitoare de aer evaporative', ru: 'Испарительные охладители', en: 'Evaporative air coolers'}, link: '/products?filter=product_type_contains_Răcitoare de aer evaporative'},
    {label: {ro: 'Pardosea', ru: 'Напольное покрытие', en: 'Flooring'}, link: '/products?filter=product_type_contains_Pardosea'}
  ];

  infoLinks = [
    {label: {ro: 'Despre noi', ru: 'О нас', en: 'About us'}, link: '/about-us'},
    {label: {ro: 'Livrare și plată', ru: 'Доставка и оплата', en: 'Delivery & payment'}, link: '/products'},
    {label: {ro: 'Promoții', ru: 'Акции', en: 'Promotions'}, link: '/products?filter=has_sale_contains_true'},
    {label: {ro: 'Contacte', ru: 'Контакты', en: 'Contacts'}, link: '/contacts'}
  ];

  legalLinks = [
    {label: {ro: 'Politica de confidențialitate', ru: 'Политика конфиденциальности', en: 'Privacy policy'}, link: ''},
    {label: {ro: 'Termeni și condiții', ru: 'Условия и положения', en: 'Terms & conditions'}, link: ''}
  ];

  get lang(): string {
    return (this.selectedLanguage || 'ro').toLowerCase();
  }

  t(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[this.lang] || value['ro'] || value['en'] || (Object.values(value)[0] as string) || '';
  }

  constructor(private formBuilder: FormBuilder,
              @Inject(PLATFORM_ID) private platformId: Object,
              private router: Router,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              private translateService: TranslateService) {
  }

  @HostListener('window:resize', ['$event'])
  checkScreenSize(event?: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 1025;
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getJsonKeys();
      this.checkScreenSize();

      this.publicService.getLanguages().subscribe((languages: any) => {
        this.languages = languages.data;
        this.cdr.detectChanges();
      })

      this.publicService.getGeneralDetails().subscribe((response: any) => {
        if (response && response.data) {
          this.generalDetails = {
            address: findObjectByKey(response.data?.[0]?.data, 'address'),
            schedule: findObjectByKey(response.data?.[0]?.data, 'schedule'),
            main_phone: findObjectByKey(response.data?.[0]?.data, 'main_phone'),
            main_email: findObjectByKey(response.data?.[0]?.data, 'main_email')
          };
        }
      })

      this.publicService.getAddresses({page: 1, rowsPerPage: 100, sortBy: 'created_at', sortOrder: 'ASC'}).subscribe((res: any) => {
        this.showrooms = (res?.data || []).map((addr: any) => ({
          name: this.t(findObjectByKey(addr.data, 'name') || findObjectByKey(addr.data, 'label')),
          address: this.t(findObjectByKey(addr.data, 'street') || findObjectByKey(addr.data, 'address'))
        })).filter((s: any) => s.name || s.address);
        this.cdr.detectChanges();
      });

      this.getData();
    }
  }

  getData() {
    this.publicService.getProductCategories({filter: 'main_contains_true'}).subscribe((data: any) => {
      data.data?.forEach((el: any, index: number) => {
        this.data.MENU["Collections"][index] = {
          "LABEL": findObjectByKey(el.data, 'label'),
          "LINK": `/products?sortBy=created_at&sortOrder=DESC&page=1&rowsPerPage=12&filter=product_category_contains_${findObjectByKey(el.data, 'label')[this.selectedLanguage]}`
        }
      });

      this.cdr.detectChanges();
    });
  }

  newsletterForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  newsletterSubmit() {
    if (this.newsletterForm.valid) {
      this.publicService.addEmail(this.newsletterForm.getRawValue()).subscribe();
    }
  }

  navigate(queryParamsString: string) {
    if (queryParamsString?.includes('/assets')) {
      this.downloadDocument(queryParamsString);
    } else if (queryParamsString?.includes('/products?')) {
      const paramsUrl = queryParamsString.split('/products?')[1];
      const queryParams: any = {};

      paramsUrl.split('&').forEach(part => {
        const item = part.split('=');
        queryParams[item[0]] = item[1];
      });

      this.router.navigate(['/products'], {queryParams});
    } else if (queryParamsString?.includes('http')) {
      window.open(queryParamsString);
    } else if (queryParamsString) {
      this.router.navigate([queryParamsString]);
    }
  }

  getJsonKeys(): void {
    this.menuColumns = Object.keys(this.data?.MENU);
    this.socialMediaKeys = Object.keys(this.data?.SOCIAL_MEDIA);
  }

  getMenuItems(sectionKey: string): string[] {
    return Object.keys(this.data.MENU[sectionKey] || {});
  }

  switchLanguage(event: any) {
    const language = event.target.value;
    this.selectedLanguage = language;
    this.translateService.translate(language);
  }

  downloadDocument(path: string) {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    const pathParts = path.split('/');
    link.href = path;
    link.download = pathParts[pathParts.length - 1];
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
