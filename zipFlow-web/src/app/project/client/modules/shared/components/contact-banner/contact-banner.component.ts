import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {PublicService} from "../../services/public.service";
import {isPlatformBrowser} from "@angular/common";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";

@Component({
  selector: 'app-contact-banner',
  templateUrl: './contact-banner.component.html',
  styleUrl: './contact-banner.component.scss'
})
export class ContactBannerComponent implements OnInit{
  contactPhone: any = {};

  constructor(private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.publicService.getGeneralDetails().subscribe((response: any) => {
        if (response && response.data) {
          this.contactPhone = {
            main_phone: findObjectByKey(response.data?.[0]?.data, 'main_phone'),
          };
          this.cdr.detectChanges();
        }
      })
    }
  }
}
