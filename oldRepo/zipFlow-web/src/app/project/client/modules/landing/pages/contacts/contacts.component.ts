import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {MetaService} from "../../../shared/services/meta.service";
import {Router} from "@angular/router";
import {PublicService} from "../../../shared/services/public.service";
import {isPlatformBrowser} from "@angular/common";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {MapCoordinates} from "../../../shared/interfaces/coordinates.interface";

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit{
  loading = true;
  generalDetails: any = {};

  coordinates: MapCoordinates = {
    latitude: 46.9878428,
    longitude: 28.8349773
  }

  mapUrl = 'https://www.google.com/maps/place/GARDECOR/@46.9878428,28.8349773,18.5z/data=!4m14!1m7!3m6!1s0x40c97eb8433b83b7:0xbb60a99ec1666ea8!2sGARDECOR!8m2!3d46.9879666!4d28.8358496!16s%2Fg%2F1t_kf0fz!3m5!1s0x40c97eb8433b83b7:0xbb60a99ec1666ea8!8m2!3d46.9879666!4d28.8358496!16s%2Fg%2F1t_kf0fz?entry=ttu&g_ep=EgoyMDI0MDkwMi4xIKXMDSoASAFQAw%3D%3D';

  constructor(private meta: MetaService,
              private router: Router,
              private publicService: PublicService,
              @Inject(PLATFORM_ID) private platformId: Object,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.meta.getMeta(this.router.url)

    if (isPlatformBrowser(this.platformId)) {
      this.publicService.getGeneralDetails().subscribe((response: any) => {
        if (response && response.data) {
          const managers = findObjectByKey(response.data?.[0]?.data, 'managers') || [];

          this.generalDetails = {
              managers: managers.map((manager: any) => ({
                name: manager.name,
                role: manager.role,
                email: manager.email,
                phone: manager.phone,
              })),
              address: findObjectByKey(response.data?.[0]?.data, 'address'),
              schedule: findObjectByKey(response.data?.[0]?.data, 'schedule'),
              main_phone: findObjectByKey(response.data?.[0]?.data, 'main_phone'),
              main_email: findObjectByKey(response.data?.[0]?.data, 'main_email'),
            };

          this.loading = false;

          this.cdr.detectChanges();
        }
      })
    }
  }
}
