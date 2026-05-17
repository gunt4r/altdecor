import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Page, PageLabels, PageSlug} from "../../../../shared/components/page-container/pages.type";
import {ActivatedRoute, Router} from "@angular/router";
import {MetaService} from "../../../../shared/services/meta.service";
import {PublicService} from "../../../../shared/services/public.service";
import {findObjectByKey} from "../../../../../../../theme/shared/utils/form.utils";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss'
})
export class BlogDetailsComponent implements OnInit {
  blogId: string | null = '';
  data: any;

  pages: Page[] = [
    {
      link: PageSlug.Products,
      label: PageLabels[PageSlug.Shop]
    },
    {
      link: PageSlug.Blog,
      label: PageLabels[PageSlug.Blog]
    }
  ];

  loading = true;

  constructor(private meta: MetaService,
              private route: ActivatedRoute,
              private router: Router,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit(): void {
    // if (isPlatformBrowser(this.platformId)) {
      // this is an workaround for url matcher, fix in future releases
      const urlParts = this.router.url.split('/');
      this.blogId = urlParts[urlParts.length - 1];

      this.getBlogData();
    // }
  }

  getBlogData() {
    this.publicService.getBlogById(this.blogId).subscribe((blogData: any) => {
      if (blogData && blogData.data) {
        const language = localStorage.getItem('language') || 'ro';
        this.meta.updateMetaData([blogData], this.router.url.split('/')[1] || 'ro', this.router.url);

        this.pages.push(<Page>{
          link: PageSlug.Blog + '/' + this.blogId,
          label: findObjectByKey(blogData.data, 'title')
        });

        this.data =
          {
            img: findObjectByKey(blogData.data, 'img')?.[0]?.['file_url'],
            title: findObjectByKey(blogData.data, 'title'),
            description: findObjectByKey(blogData.data, 'description'),
            author: findObjectByKey(blogData.data, 'author'),
            author_img: findObjectByKey(blogData.data, 'author_img')?.[0]?.['file_url'],
            recommended: findObjectByKey(blogData.data, 'recommended'),
            reading: findObjectByKey(blogData.data, 'reading'),
            tags: findObjectByKey(blogData.data, 'tags'),
            date: findObjectByKey(blogData.data, 'date')
          }

        this.loading = false;

        this.cdr.detectChanges();
      }
    })
  }

  buy() {
    this.router.navigate(['/products']);
  }
}
