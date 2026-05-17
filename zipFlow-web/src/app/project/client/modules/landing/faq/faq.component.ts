import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {PublicService} from "../../shared/services/public.service";
import {findObjectByKey} from "../../../../../theme/shared/utils/form.utils";

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FAQComponent implements OnInit {
  faqItems: any;

  constructor(private publicService: PublicService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.publicService.getFAQ().subscribe((response: any) => {
      if (response && response.data) {
        this.faqItems = response.data.map((item: any) => {
          return {
            question: findObjectByKey(item.data, 'question'),
            answer: findObjectByKey(item.data, 'answer')
          }
        })
      }

      this.cdr.detectChanges();
    })
  }
}
