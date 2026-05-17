import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {PublicService} from "../../../../shared/services/public.service";
import {findObjectByKey} from "../../../../../../../theme/shared/utils/form.utils";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-interior-divisions',
  templateUrl: './interior-divisions.component.html',
  styleUrl: './interior-divisions.component.scss'
})
export class InteriorDivisionsComponent implements OnInit{
  interiorDivisions: any;

  constructor(private publicService: PublicService, private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    // if(isPlatformBrowser(this.platformId)) {
      this.publicService.getInteriorDiv().subscribe((response: any) => {
        if (response && response.data) {
          this.interiorDivisions = response.data.map((item: any) => {
            return {
              id: item.id,
              img: findObjectByKey(item.data, 'img')?.[0]?.['file_url'],
              title: findObjectByKey(item.data, 'title'),
              description: findObjectByKey(item.data, 'description'),
              category: findObjectByKey(item.data, 'category'),
              button_label: findObjectByKey(item.data, 'button_label'),
              button_link: findObjectByKey(item.data, 'button_link'),
            };
          });
          // Sort interiorDivisions array by id for a correct order in view
          this.interiorDivisions.sort((a: { id: number }, b: { id: number }) => a.id - b.id);

          this.cdr.detectChanges();
        }
      });
    // }
  }
}
