import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {findObjectByKey} from "../../../../../../../theme/shared/utils/form.utils";
import {PublicService} from "../../../../shared/services/public.service";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-trendings',
  templateUrl: './trendings.component.html',
  styleUrl: './trendings.component.scss'
})
export class TrendingsComponent implements OnInit {
  trendings: any;

  constructor(private publicService: PublicService,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    // if(isPlatformBrowser(this.platformId)) {
      this.publicService.getBlogs({}).subscribe((response: any) => {
        if (response && response.data) {
          this.trendings = response.data.map((item: any) => {
            return {
              id: item.id,
              img: findObjectByKey(item.data, 'img')?.[0]?.['file_url'],
              title: findObjectByKey(item.data, 'title'),
              description: findObjectByKey(item.data, 'description'),
              author: findObjectByKey(item.data, 'author'),
              recommended: findObjectByKey(item.data, 'recommended'),
              reading: findObjectByKey(item.data, 'reading'),
              tags: findObjectByKey(item.data, 'tags'),
              date: findObjectByKey(item.data, 'date')
            };
          })
            .filter((item: any) => item.recommended === true)
            .slice(0, 3);
        }
      });
    // }
  }
}
