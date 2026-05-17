import {Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {TruncateService} from "../../../../shared/services/truncate.service";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-blogs-list',
  templateUrl: './blogs-list.component.html',
  styleUrl: './blogs-list.component.scss'
})
export class BlogsListComponent implements OnInit{
  @Input() articles!: any;
  @Input() total!: number;
  @Input() loading: boolean = false;
  @Output() loadNextPage = new EventEmitter;

  constructor(private truncateService: TruncateService,
              @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if(isPlatformBrowser(this.platformId)) {
      if (this.articles) {
        this.articles.forEach((article: any) => {
          const truncatedDescriptions: {[key: string]: string} = {};
          Object.keys(article.description).forEach((language: string) => {
            truncatedDescriptions[language] = this.truncateService.truncateText(article.description[language], 3, 150);
          });
          article.truncatedDescriptions = truncatedDescriptions;
        });
      }
    }
  }
}
