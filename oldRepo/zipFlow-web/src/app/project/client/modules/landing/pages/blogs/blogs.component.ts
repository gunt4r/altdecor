import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Page, PageLabels, PageSlug} from "../../../shared/components/page-container/pages.type";
import {FilterType} from "../../../shared/interfaces/filters.interface";
import {PublicService} from "../../../shared/services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {MetaService} from "../../../shared/services/meta.service";
import {ActivatedRoute, Router} from "@angular/router";
import {
  ApiParams,
  getApiParams,
  getQueryFilterParams,
  LinkWord,
  ParamsPrefix,
  SortTypes
} from "../../../../../../theme/client/utils/api-params.utils";
import {forkJoin, Subscription, tap} from "rxjs";
import {QueryParamsService} from "../../../../../../theme/shared/services/query-params.service";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent implements OnInit {
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

  articles: any;
  filters: any = [];

  subscriptions: Subscription[] = [];

  defaultPaging = {
    page: 1,
    rowsPerPage: 9
  };

  params: ApiParams = this.defaultPaging;
  sortParam: any = undefined;
  filterParam: any = undefined;
  searchParam: any = undefined;
  labels: any;
  types: any;

  saveOld: boolean = false;
  searchString: string = '';
  blogsLoading = false;

  constructor(private meta: MetaService,
              private router: Router,
              private publicService: PublicService,
              private route: ActivatedRoute,
              private qpService: QueryParamsService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    this.meta.getMeta(this.router.url)

    if(isPlatformBrowser(this.platformId)) {
      this.qpService.updateParams({
        'sortBy': 'created_at',
        'sortOrder': SortTypes.DESC,
        'page': this.defaultPaging.page,
        'rowsPerPage': this.defaultPaging.rowsPerPage
      });

      this.sortParam = {
        'sortBy': 'created_at',
        'sortOrder': SortTypes.DESC
      }

      this.subscriptions.push(this.route.queryParams.subscribe((p: any) => {
        if (!Object.keys(p)?.length) {
          this.params.page = 1;

          this.qpService.updateParams({
            'sortBy': 'created_at',
            'sortOrder': SortTypes.DESC,
            'page': this.defaultPaging.page,
            'rowsPerPage': this.defaultPaging.rowsPerPage
          });
        } else {
          this.params = p;
          this.getFilterParams(p)
        }

        this.getFilterConfig(p);
      }));
    }
  }


  getFilterConfig(params: any) {
    if (!this.labels || !this.types) {
      forkJoin([this.publicService.getBlogFilterLabels(), this.publicService.getBlogCategories()]).pipe(
        tap(([labels, types]) => {
          this.labels = labels;
          this.types = types;
          this.getFilters(params);
        })
      ).subscribe();
    } else {
      this.getFilters(params);
    }
  }

  getFilters(params: any) {
    this.filters = [];
    const language = localStorage.getItem('language') || 'ro';

    const blogCategories = this.labels.filter((el: any) => el['blog_category']);

    if (blogCategories?.length) {
      let categories: any = [];
      blogCategories?.forEach((category: any) => {
        if (category?.['blog_category']) {
          category?.['blog_category'].forEach((blogCategory: any) => {
            if (!categories.find((el: any) => el[language] === blogCategory.value?.name?.[language])) {
              categories.push(blogCategory.value.name);
            }
          })
        }
      });

      this.filters.push({
        filter_type: FilterType.Dropdown,
        db_key: `blog_category`,
        label: 'Blog.FilterCategory',
        options: categories,
        value: categories.filter((category: any) => Object.keys(category).find((key: string) =>
          params?.['filter']?.split(ParamsPrefix.AND).find((andParam: string) => andParam.includes('blog_category'))?.split(ParamsPrefix.OR).find((paramEl: string) => paramEl.split(LinkWord.CONTAINS)[1] === category[key]))) || []
      })
    }

    this.cdr.detectChanges();
  }

  getFilterParams(params: any) {
    let apiFilterParams = undefined;

    if (params.filter) {
      apiFilterParams = getQueryFilterParams(params.filter);
    }

    this.params = getApiParams(this.searchParam, apiFilterParams, this.sortParam, params.page || this.defaultPaging.page, params.rowsPerPage || this.defaultPaging.rowsPerPage, false);
    this.getData(this.params);
  }

  filtersChange(event: any) {
    let filterParams: any = [];
    if (event['blog_category']?.length) {
      event['blog_category'].forEach((el: any, elIndex: number) => {
        filterParams = [...filterParams, {
          key: 'blog_category',
          value: el?.[localStorage.getItem('language') || 'ro'],
          linkWord: LinkWord.CONTAINS,
          prefix: (elIndex === event['blog_category'].length - 1) ? '' : ParamsPrefix.OR
        }]
      })
    }

    this.filterParam = filterParams;
    this.params.page = 1;
    this.qpService.updateParams(getApiParams(this.searchString, this.filterParam, this.sortParam, this.defaultPaging.page, this.defaultPaging.rowsPerPage));
  }

  getData(params: any) {
    this.blogsLoading = true;
    this.publicService.getBlogs(params).subscribe((response: any) => {
      if (response && response.data) {
        this.articles = {
          content: (this.saveOld ? this.articles.content : []).concat(response.data.map((item: any) => {
            return {
              id: item.id,
              img: findObjectByKey(item.data, 'img')?.[0]?.['file_url'],
              title: findObjectByKey(item.data, 'title'),
              description: findObjectByKey(item.data, 'description'),
            };
          })),
          total: response.meta.total
        }

        this.saveOld = false;
        this.blogsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNextPage() {
    this.params.page++;
    this.saveOld = true;
    this.qpService.updateParams(getApiParams(this.searchString, this.filterParam, this.sortParam, this.params.page, this.defaultPaging.rowsPerPage));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }
}
