import {ChangeDetectorRef, Component, DestroyRef, HostListener, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {PageSlug} from "../../shared/components/page-container/pages.type";
import {NavigationEnd, Router} from "@angular/router";
import {PublicService} from "../../shared/services/public.service";
import {findObjectByKey} from "../../../../../theme/shared/utils/form.utils";
import {filter} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

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
      "FACEBOOK": {
        "IMG": "assets/images/content/facebook-logo.svg",
        "LINK": "https://www.facebook.com/altdecor.md",
        "ALT": "Facebook logo"
      },
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
      "Informatii": {
        "ABOUT_US": {
          "LABEL": "Despre noi",
          "LINK": PageSlug.AboutUs
        },
        "DELIVERY": {
          "LABEL": "Livrare și plată",
          "LINK": PageSlug.Faq
        },
        "PROMOTII": {
          "LABEL": "Promoții",
          "LINK": PageSlug.Products
        },
        "CONTACT_US": {
          "LABEL": "Contacte",
          "LINK": PageSlug.Contacts
        }
      },
      "Collections": {},
      "Legal": {
        "CONFIDENTIALITATE": {
          "LABEL": "Privacy Policy",
          "LINK": PageSlug.AboutUs
        },
        "TERMENI_CONDITII": {
          "LABEL": "Terms of Service",
          "LINK": PageSlug.Faq
        }
      }
    },
    "COPYRIGHT_OWNER": "Gardecor",
    "COPYRIGHT": "©"
  };

  mapUrl = 'https://www.google.com/maps/place/Gheorghe+Madan+Strada,+Chi%C8%99in%C4%83u,+Moldova/@47.0607145,28.8417865,17z/data=!3m1!4b1!4m6!3m5!1s0x40c97d104d43b385:0x33b52c5d28105ac3!8m2!3d47.0607145!4d28.8443614!16s%2Fg%2F11cly7c_gh?entry=ttu';
  selectedLanguage: string = 'ro';

  readonly footerLabelsByLanguage: Record<string, any> = {
    ro: {
      magazine: 'Magazine',
      produse: 'Produse',
      informatii: 'Informații',
      description: 'Experți în panouri decorative pentru spații moderne'
    },
    ru: {
      magazine: 'Магазины',
      produse: 'Продукты',
      informatii: 'Информация',
      description: 'Эксперты по декоративным панелям для современных пространств'
    },
    en: {
      magazine: 'Stores',
      produse: 'Products',
      informatii: 'Information',
      description: 'Experts in decorative panels for modern spaces'
    }
  };

  get footerLabels() {
    return this.footerLabelsByLanguage[this.selectedLanguage] || this.footerLabelsByLanguage['ro'];
  }

  get footerDescription(): string {
    return this.footerLabels.description;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private router: Router,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              private destroy: DestroyRef) {
  }

  @HostListener('window:resize', ['$event'])
  checkScreenSize(event?: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 1025;
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.selectedLanguage = localStorage.getItem('language') || 'ro';
      this.rebuildStaticLabels();
      this.getJsonKeys();
      this.checkScreenSize();

      this.publicService.getGeneralDetails().subscribe((response: any) => {
        if (response && response.data) {
          this.generalDetails = {
            address: findObjectByKey(response.data?.[0]?.data, 'address'),
            schedule: findObjectByKey(response.data?.[0]?.data, 'schedule'),
            main_phone: findObjectByKey(response.data?.[0]?.data, 'main_phone'),
            main_email: findObjectByKey(response.data?.[0]?.data, 'main_email')
          };

          this.cdr.detectChanges();
        }
      })

      this.getData();

      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroy)
      ).subscribe(() => {
        const language = this.getLanguage();
        if (language !== this.selectedLanguage) {
          this.selectedLanguage = language;
          this.rebuildStaticLabels();
          this.getData();
        }
      });
    }
  }

  getData() {
    this.publicService.getProductTypes({page: 1, rowsPerPage: 1000}).subscribe((data: any) => {
      this.data.MENU["Collections"] = {};

      (data.data || []).slice(0, 7).forEach((el: any, index: number) => {
        const label = findObjectByKey(el.data, 'label');
        const localizedLabel = label?.[this.selectedLanguage] || label?.ro || Object.values(label || {})[0] || '';

        this.data.MENU["Collections"][index] = {
          "LABEL": localizedLabel,
          "LINK": `/products?sortBy=created_at&sortOrder=DESC&page=1&rowsPerPage=12&filter=product_type_contains_${localizedLabel}`
        }
      });

      this.cdr.detectChanges();
    });
  }

  navigate(queryParamsString: string) {
    if (!queryParamsString) {
      return;
    }

    if (queryParamsString?.includes('/assets')) {
      this.downloadDocument(queryParamsString);
    } else if (queryParamsString?.includes('/products?')) {
      const paramsUrl = queryParamsString.split('/products?')[1];
      const queryParams: any = {};

      paramsUrl.split('&').forEach(part => {
        const item = part.split('=');
        queryParams[item[0]] = decodeURIComponent(item[1]);
      });

      this.router.navigate([`/${this.getLanguage()}/products`], {queryParams});
    } else if (queryParamsString?.includes('http')) {
      window.open(queryParamsString);
    } else if (queryParamsString) {
      if (queryParamsString === '/') {
        this.router.navigate([`/${this.getLanguage()}`]);
      } else {
        this.router.navigate([`/${this.getLanguage()}${queryParamsString}`]);
      }
    }
  }

  getJsonKeys(): void {
    this.menuColumns = Object.keys(this.data?.MENU);
    this.socialMediaKeys = Object.keys(this.data?.SOCIAL_MEDIA);
  }

  getMenuItems(sectionKey: string): string[] {
    return Object.keys(this.data.MENU[sectionKey] || {});
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

  private getLanguage(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'ro';
    }

    return (localStorage.getItem('language') || 'ro').toLowerCase();
  }

  private rebuildStaticLabels() {
    const language = this.getLanguage();

    this.data.MENU["Informatii"] = {
      "ABOUT_US": {
        "LABEL": language === 'ru' ? 'О нас' : language === 'en' ? 'About us' : 'Despre noi',
        "LINK": PageSlug.AboutUs
      },
      "DELIVERY": {
        "LABEL": language === 'ru' ? 'Доставка и оплата' : language === 'en' ? 'Delivery and payment' : 'Livrare și plată',
        "LINK": PageSlug.Faq
      },
      "PROMOTII": {
        "LABEL": language === 'ru' ? 'Промо' : language === 'en' ? 'Promotions' : 'Promoții',
        "LINK": PageSlug.Products
      },
      "CONTACT_US": {
        "LABEL": language === 'ru' ? 'Контакты' : language === 'en' ? 'Contacts' : 'Contacte',
        "LINK": PageSlug.Contacts
      }
    };

    this.data.MENU["Legal"] = {
      "CONFIDENTIALITATE": {
        "LABEL": language === 'ru' ? 'Политика конфиденциальности' : language === 'en' ? 'Privacy Policy' : 'Politica de confidențialitate',
        "LINK": PageSlug.AboutUs
      },
      "TERMENI_CONDITII": {
        "LABEL": language === 'ru' ? 'Условия использования' : language === 'en' ? 'Terms of Service' : 'Termeni și condiții',
        "LINK": PageSlug.Faq
      }
    };
  }
}
