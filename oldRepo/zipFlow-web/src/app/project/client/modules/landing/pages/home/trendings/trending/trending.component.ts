import {Component, HostListener, Inject, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";
import {TruncateService} from "../../../../../shared/services/truncate.service";

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrl: './trending.component.scss'
})
export class TrendingComponent implements OnInit{
  @Input({ required: true }) config!: any;
  @Input({ required: true }) width!: number;
  @Input() isMainBlog!: boolean;
  isMobile: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private truncateService: TruncateService) {
  }

  @HostListener('window:resize', ['$event'])
  checkScreenSize(event?: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 1200;
    }
  }

  ngOnInit() {
    this.checkScreenSize();
    if (this.config) {
      const truncatedDescriptions: {[key: string]: string} = {};
      Object.keys(this.config.description).forEach((language: string) => {
        truncatedDescriptions[language] = this.truncateService.truncateText(this.config.description[language], 4, 200);
      });
      this.config.truncatedDescriptions = truncatedDescriptions;
    }
  }
}
