import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {TruncateService} from '../../services/truncate.service';
import {PublicService} from '../../services/public.service';
import {findObjectByKey} from '../../../../../../theme/shared/utils/form.utils';
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-blog-recommendation',
  templateUrl: './blog-recommendation.component.html',
  styleUrls: ['./blog-recommendation.component.scss']
})
export class BlogRecommendationComponent implements OnInit, OnDestroy {
  recommendedArticles: any[] = [];
  private routerSubscription!: Subscription;

  constructor(private truncateService: TruncateService,
              private publicService: PublicService,
              private router: Router,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();

      this.routerSubscription = this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        location.reload();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadData(): void {
    this.publicService.getBlogs({}).subscribe((response: any) => {
      if (response && response.data) {
        this.recommendedArticles = response.data.map((item: any) => {
          return {
            id: item.id,
            img: findObjectByKey(item.data, 'img')?.[0]?.['file_url'],
            title: findObjectByKey(item.data, 'title'),
            description: findObjectByKey(item.data, 'description'),
            recommended: findObjectByKey(item.data, 'recommended'),
          };
        })
          .filter((item: any) => item.recommended === true)
          .slice(0, 4);

        this.recommendedArticles.forEach((article: any) => {
          const truncatedDescriptions: { [key: string]: string } = {};
          Object.keys(article.description).forEach((language: string) => {
            truncatedDescriptions[language] = this.truncateService.truncateText(article.description[language], 2, 100);
          });
          article.truncatedDescriptions = truncatedDescriptions;
        });

        this.cdr.detectChanges();
      }
    });
  }
}
