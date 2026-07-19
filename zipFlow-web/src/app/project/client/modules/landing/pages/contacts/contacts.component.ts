import {ChangeDetectorRef, Component, DestroyRef, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {MetaService} from "../../../shared/services/meta.service";
import {NavigationEnd, Router} from "@angular/router";
import {PublicService} from "../../../shared/services/public.service";
import {isPlatformBrowser} from "@angular/common";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {catchError, filter, forkJoin, of} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

type AddressItem = {
  name: string;
  street: string;
  phone: string;
  email: string;
  schedule: string[];
  mapUrl: string;
};

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  loading = true;
  addresses: AddressItem[] = [];
  designerPhones: { name: string, phone: string }[] = [];
  mapEmbedUrl: SafeResourceUrl | null = null;
  currentLanguage = 'ro';

  // Default location (GARDECOR) used for the embedded map and the "open map" button.
  mapUrl = 'https://www.google.com/maps/place/GARDECOR/@46.9878428,28.8349773,18.5z/data=!4m14!1m7!3m6!1s0x40c97eb8433b83b7:0xbb60a99ec1666ea8!2sGARDECOR!8m2!3d46.9879666!4d28.8358496!16s%2Fg%2F1t_kf0fz!3m5!1s0x40c97eb8433b83b7:0xbb60a99ec1666ea8!8m2!3d46.9879666!4d28.8358496!16s%2Fg%2F1t_kf0fz?entry=ttu';

  readonly uiByLanguage: Record<string, any> = {
    ro: {contactsTitle: 'Contacte', mapButton: 'HARTĂ INTERACTIVĂ', designerTitle: 'Pentru Designeri', designerNote: 'Număr de contact — în curând disponibil'},
    ru: {contactsTitle: 'Контакты', mapButton: 'ИНТЕРАКТИВНАЯ КАРТА', designerTitle: 'Для Дизайнеров', designerNote: 'Контактный номер — скоро будет доступен'},
    en: {contactsTitle: 'Contacts', mapButton: 'INTERACTIVE MAP', designerTitle: 'For Designers', designerNote: 'Contact number — coming soon'}
  };

  get ui() {
    return this.uiByLanguage[this.currentLanguage] || this.uiByLanguage['ro'];
  }

  constructor(private meta: MetaService,
              private router: Router,
              private publicService: PublicService,
              private sanitizer: DomSanitizer,
              private destroy: DestroyRef,
              @Inject(PLATFORM_ID) private platformId: Object,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.meta.getMeta(this.router.url);
    this.currentLanguage = this.getLanguage();
    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.google.com/maps?q=46.9878428,28.8349773&z=17&output=embed'
    );

    if (isPlatformBrowser(this.platformId)) {
      this.loadContacts();

      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroy)
      ).subscribe(() => {
        const language = this.getLanguage();
        if (language !== this.currentLanguage) {
          this.currentLanguage = language;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private loadContacts() {
    this.loading = true;
    forkJoin([
      this.publicService.getAddresses({page: 1, rowsPerPage: 100, sortBy: 'created_at', sortOrder: 'ASC'}).pipe(catchError(() => of({data: []}))),
      this.publicService.getGeneralDetails().pipe(catchError(() => of({data: []}))),
      this.publicService.getSiteConfig({page: 1, rowsPerPage: 100}).pipe(catchError(() => of({data: []})))
    ]).pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(([addresses, general, siteConfig]) => {
      this.buildAddresses(addresses?.data || []);
      this.buildDesignerPhones(siteConfig?.data || []);
      this.loading = false;
      this.cdr.detectChanges();
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

  openMap(url?: string) {
    if (typeof window !== 'undefined') {
      window.open(url || this.mapUrl, '_blank');
    }
  }

  private getLanguage(): string {
    if (typeof localStorage === 'undefined') return 'ro';
    return (localStorage.getItem('language') || 'ro').toLowerCase();
  }
}
