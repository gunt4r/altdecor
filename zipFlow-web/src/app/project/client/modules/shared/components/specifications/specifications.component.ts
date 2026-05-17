import {ChangeDetectorRef, Component, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {Color} from "../../types/color.type";
import {PublicService} from "../../services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-specifications',
  templateUrl: './specifications.component.html',
  styleUrl: './specifications.component.scss'
})
export class SpecificationsComponent implements OnInit {
  @Input() background: Color = '#fff';
  advantages: string[] = [];
  contactPhone: any = {};

  constructor(private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.publicService.getAdvantages().subscribe((response: any) => {
        if (response && response.data) {
          this.advantages = response.data.map((item: any) => {
            return {
              img: findObjectByKey(item.data, 'img')?.[0]?.['file_url'],
              title: findObjectByKey(item.data, 'title'),
              description: findObjectByKey(item.data, 'description'),
              hasContact: findObjectByKey(item.data, 'hasContact')
            };
          });

          this.cdr.detectChanges();
        }
      });
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
