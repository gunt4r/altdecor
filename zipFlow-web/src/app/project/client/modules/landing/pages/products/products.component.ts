import {ChangeDetectorRef, Component, DestroyRef, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {FiltersComponent} from "../../../shared/components/filters/filters.component";
import {Page, PageLabels, PageSlug} from "../../../shared/components/page-container/pages.type";
import {FilterType} from "../../../shared/interfaces/filters.interface";
import {MetaService} from "../../../shared/services/meta.service";
import {ActivatedRoute, Router} from "@angular/router";
import {PublicService} from "../../../shared/services/public.service";
import {
  ApiParams,
  getApiParams,
  getQueryFilterParams,
  LinkWord,
  ParamsPrefix,
  SortTypes
} from "../../../../../../theme/client/utils/api-params.utils";
import {findObjectByKey, getLocalized} from "../../../../../../theme/shared/utils/form.utils";
import {ProductsSort} from "./products-header/products-sort.enum";
import {catchError, forkJoin, of, tap} from "rxjs";
import {QueryParamsService} from "../../../../../../theme/shared/services/query-params.service";
import {isPlatformBrowser} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  pages: Page[] = [
    {
      link: PageSlug.Products,
      label: PageLabels[PageSlug.Shop]
    },
    {
      link: PageSlug.Products,
      label: PageLabels[PageSlug.Products]
    }
  ];

  products: any;

  // Page heading. Reflects the product_type the user navigated to (the label
  // comes straight from the DB/admin filter value in the URL — never hardcoded);
  // falls back to the generic "Shop Categorii" label when browsing everything.
  pageTitle = '';

  filters: any = [];

  @ViewChild(FiltersComponent) filtersComp?: FiltersComponent;
  activeChips: { dbKey: string; option: any; label: string }[] = [];

  defaultPaging = {
    page: 1,
    rowsPerPage: 12
  };

  params: ApiParams = this.defaultPaging;
  sortParam: any = undefined;
  // When a price sort is active we sort the fetched products numerically on the
  // client ('asc' = cheap→expensive, 'desc' = expensive→cheap); null = default order.
  priceSortOrder: 'asc' | 'desc' | null = null;
  // For a price sort the whole result set is fetched and sorted once, then paged
  // on the client so we still show 12 at a time (a working "show more") instead of
  // dumping all ~400 cards at once.
  private sortedPool: any[] = [];
  private clientPage = 1;
  filterParam: any = undefined;
  searchParam: any = undefined;
  labels: any;
  types: any;
  categories: any;

  saveOld: boolean = false;
  searchString: string = '';
  productsLoading = false;
  isFilterOpen = false;

  browserLoaded = false;

  // Filter-group placeholders shown in the initial-load skeleton.
  skeletonRows = Array.from({length: 7});

  constructor(private meta: MetaService,
              private router: Router,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              private route: ActivatedRoute,
              private qpService: QueryParamsService,
              private destroy: DestroyRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    this.meta.getMeta(this.router.url);

    this.browserLoaded = isPlatformBrowser(this.platformId);

    if (this.browserLoaded) {
      this.qpService.updateParams({
        sortBy: 'created_at',
        sortOrder: SortTypes.DESC,
        page: this.defaultPaging.page,
        rowsPerPage: this.defaultPaging.rowsPerPage
      });

      this.route.queryParams
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe((params: any) => {
          if (!Object.keys(params)?.length) {
            this.params.page = 1;
            this.qpService.updateParams({
              sortBy: 'created_at',
              sortOrder: SortTypes.DESC,
              page: this.defaultPaging.page,
              rowsPerPage: this.defaultPaging.rowsPerPage
            });
          } else {
            this.params = params;
            this.getFilterParams(params);
          }

          this.getFilterConfig(params);
        });
    }
  }

  getFilterConfig(params: any) {
    const queryParams = {
      page: 1,
      rowsPerPage: 1000
    };

    if (!this.labels || !this.types) {
      forkJoin([this.publicService.getProductsFilterLabels(), this.publicService.getProductTypes(queryParams), this.publicService.getProductCategories(queryParams)]).pipe(
        tap(([labels, types, categories]) => {
          this.labels = labels;
          this.types = types;
          this.categories = categories;
          this.getFilters(params);
        }),
        takeUntilDestroyed(this.destroy)
      ).subscribe();
    } else {
      this.getFilters(params);
    }
  }

  getFilterParams(params: any) {
    // Price is stored as a STRING in the product JSON, and many products have an
    // empty price. Sorting that field server-side gives a lexicographic order
    // ("1200" < "400") with empty values scattered through the list. So for the
    // two price sorts we fetch the whole result set and sort it numerically on
    // the client (unpriced items always pushed to the end). created_at DESC stays
    // the server order in every case.
    this.sortParam = {
      sortBy: 'created_at',
      sortOrder: SortTypes.DESC
    };
    if (params.sortBy === ProductsSort.Cheap2Expensive) {
      this.priceSortOrder = 'asc';
    } else if (params.sortBy === ProductsSort.Expensive2Cheap) {
      this.priceSortOrder = 'desc';
    } else {
      this.priceSortOrder = null;
    }
    // Fresh query (sort/filter change) → restart the client-side paging window.
    this.clientPage = 1;
    this.sortedPool = [];

    if (params.search) {
      this.searchString = params.search;

      this.searchParam = [
        {
          key: 'product_type',
          value: params.search,
          linkWord: LinkWord.CONTAINS,
          prefix: ParamsPrefix.OR
        },
        {
          key: 'product_category',
          value: params.search,
          linkWord: LinkWord.CONTAINS,
          prefix: ParamsPrefix.OR
        },
        {
          key: 'sku',
          value: params.search,
          linkWord: LinkWord.CONTAINS,
          prefix: ParamsPrefix.OR
        },
        {
          key: 'title',
          value: params.search,
          linkWord: LinkWord.CONTAINS
        }
      ]
    } else {
      this.searchParam = undefined;
    }

    let apiFilterParams = undefined;
    this.pageTitle = '';

    if (params.filter) {
      const parsedFilterParams = getQueryFilterParams(params.filter);

      // Heading follows the product_type the user is browsing (DB label from the URL).
      const typeParam = parsedFilterParams.find((el: any) => el.key === 'product_type');
      this.pageTitle = typeParam?.value || '';

      apiFilterParams = parsedFilterParams.map((el: any) => {
        if (el.key === 'height') {
          return {
            ...el,
            key: 'configurations',
            value: `${el.value}x`
          }
        } else if (el.key === 'width') {
          return {
            ...el,
            key: 'configurations',
            value: `x${el.value}x`
          }
        } else if (el.key === 'length') {
          return {
            ...el,
            key: 'configurations',
            value: `x${el.value}`
          }
        } else if (el.key.includes('characteristic_')) {
          return {
            ...el,
            key: 'characteristic',
            value: `${el.value}`
          }
        } else {
          return el;
        }
      })
    }

    this.filterParam = apiFilterParams;

    // For a price sort we need the full result set in one shot so it can be
    // ordered numerically client-side; "show more" is irrelevant then.
    const rowsPerPage = this.priceSortOrder ? 1000 : (params.rowsPerPage || this.defaultPaging.rowsPerPage);
    this.params = getApiParams(this.searchParam, apiFilterParams, this.sortParam, params.page || this.defaultPaging.page, rowsPerPage, false);
    this.getData(this.params);
  }

  getFilters(params: any) {
    this.filters = [];
    const labelTypes = this.labels.filter((el: any) => el['product_type']);
    const labelCategories = this.labels.filter((el: any) => el['product_category']);

    const filterTypes = this.types?.data.filter((el: any) =>
      findObjectByKey(el.data, 'show_in_filters') &&
      labelTypes.some((labelType: any) =>
        labelType['product_type']?.some((pt: any) => pt['value']?.['id'] === el.id)
      )
    ).map((el: any) => {
      const previousCategories = findObjectByKey(el.data, 'categories');
      const newCategories = previousCategories.filter((category: any) =>
        labelCategories.some((labelCategory: any) =>
          labelCategory['product_category']?.some((pc: any) => pc['value']?.['id'] === category['value']['id'])
        )
      );

      const combinedCategories = Array.from(
        new Set([...previousCategories, ...newCategories])
      );

      return {
        label: findObjectByKey(el.data, 'label'),
        categories: combinedCategories
      };
    });

    if (filterTypes?.length) {
      filterTypes.forEach((filterType: any, index: number) => {
        const categories = filterType.categories?.map((category: any) => category['value']['label']);
        this.filters.push({
          filter_type: FilterType.Dropdown,
          db_key: `product_type-${index}`,
          label: filterType.label,
          options: categories,
          mainFilter: true,
          value: categories.filter((category: any) => Object.keys(category).find((key: string) =>
            params?.['filter']?.split(ParamsPrefix.AND).find((andParam: string) => andParam.includes('product_category'))?.split(ParamsPrefix.OR).find((paramEl: string) => paramEl.split(LinkWord.CONTAINS)[1] === category[key]))) || []
        })
      })
    }

    // check if any active filter from url params
    this.filters.forEach((filter: any) => {
      if (filter.value) {
        this.setNestedFilters(filter.value, params);
      }
    })

    this.buildChips();
    this.cdr.detectChanges();
  }

  buildChips() {
    const chips: { dbKey: string; option: any; label: string }[] = [];
    // A category can belong to more than one product_type group, so the same
    // selection surfaces in several filter groups. Dedupe by label so it shows
    // as a single chip (removeChip clears it from every group).
    const seen = new Set<string>();
    (this.filters || []).forEach((f: any) => {
      const val = f.value;
      const add = (option: any, label: string) => {
        const key = String(label).toLowerCase();
        if (!label || seen.has(key)) return;
        seen.add(key);
        chips.push({dbKey: f.db_key, option, label});
      };
      if (Array.isArray(val)) {
        val.forEach((opt: any) => add(opt, getLocalized(opt) || opt));
      } else if (typeof val === 'string' && val) {
        add(val, val);
      }
    });
    this.activeChips = chips;
  }

  removeChip(chip: { dbKey: string; option: any; label: string }) {
    this.filtersComp?.removeValue(chip.dbKey, chip.option);
  }

  setNestedFilters(nestedCategoryValue: any, params?: any) {
    if (nestedCategoryValue?.length) {
      const language = localStorage.getItem('language') || 'ro';
      const mCategory = this.categories?.data?.find((mainCategory: any) => getLocalized(findObjectByKey(mainCategory.data, 'label'), language) === getLocalized(nestedCategoryValue[0], language));

      if (mCategory) {
        const mCategoryFilters = findObjectByKey(mCategory.data, 'filters');

        if (mCategoryFilters?.length) {
          mCategoryFilters.forEach((filter: any) => {
            filter = filter?.['config']?.[0];
            const filterKey = filter?.key?.toLowerCase()?.trim();
            const filterLabel = filter?.label;
            const filterType = filter.type?.[0]?.key;
            const labelData = this.labels.filter((el: any) => el[filterKey]);
            const isConfiguration = filterKey === 'configurations configuration size';
            const isCharacteristic = filterKey?.split('>')?.[0]?.trim() === 'characteristic property value';
            const characteristicKey = filterKey?.split('>')?.[1]?.trim();

            if (isCharacteristic) {
              const labelConfigurations = this.labels.filter((el: any) => el['characteristic']);
              const characteristics: any = [];

              labelConfigurations.forEach((conf: any) => {
                conf.characteristic?.forEach((innerConf: any) => {
                  const innerObj = innerConf.property?.[0]?.key;

                  if (Object.keys(innerObj).find((key: string) => innerObj[key]?.toLowerCase() === characteristicKey)) {
                    characteristics.push(innerConf.property?.[0]?.value);
                  }
                })
              })

              // const data = labelConfigurations?.map((el: any) => el['characteristic'][0]['value']['label']);

              this.filters.push({
                filter_type: filterType === 'multiselect' ? FilterType.Checkbox : FilterType.Radio,
                // db_key: filterKey,
                db_key: 'characteristic_' + characteristicKey,
                label: filterLabel,
                options: characteristics,
                value: params ? characteristics.filter((category: any) => Object.keys(category).find((key: string) =>
                  params?.['filter']?.split(ParamsPrefix.AND).find((andParam: string) => andParam.includes('characteristic_' + characteristicKey))?.split(ParamsPrefix.OR).find((paramEl: string) => paramEl.split(LinkWord.CONTAINS)[1] === category[key]))) || [] : []
              })
            } else {
              if (isConfiguration) {
                const labelConfigurations = this.labels.filter((el: any) => el['configurations']);

                if (labelConfigurations?.length) {
                  let sizes: string[] = [];
                  let length: string[] = [];
                  let height: string[] = [];
                  let width: string[] = [];

                  labelConfigurations.forEach((el: any) => el['configurations'].forEach((configuration: any) => {
                    if (configuration['configuration'][0]?.['size']) {
                      sizes.push(configuration['configuration'][0]['size']);
                    }
                  }));

                  if (sizes?.length) {
                    sizes.forEach(size => {
                      const sizeParts = size.toLowerCase().split('x');
                      if (!height.find(el => el === sizeParts[0])) {
                        height.push(sizeParts[0]);
                      }
                      if (!width.find(el => el === sizeParts[1])) {
                        width.push(sizeParts[1]);
                      }
                      if (!length.find(el => el === sizeParts[2])) {
                        length.push(sizeParts[2]);
                      }
                    });

                    if (height?.length) {
                      const param = params?.['filter']?.split(ParamsPrefix.AND)?.find((andParam: string) => andParam.includes('height'))?.split(ParamsPrefix.OR)?.[0]?.split(LinkWord.CONTAINS)?.[1];

                      this.filters.push({
                        filter_type: FilterType.Radio,
                        db_key: `height`,
                        label: 'Product.Label.Depth',
                        options: height.map(el => `${el} mm`),
                        value: param ? Number(param.match(/\d+/)[0]) + ' mm' : null
                      })
                    }

                    if (width?.length) {
                      const param = params?.['filter']?.split(ParamsPrefix.AND)?.find((andParam: string) => andParam.includes('width'))?.split(ParamsPrefix.OR)?.[0]?.split(LinkWord.CONTAINS)?.[1];

                      this.filters.push({
                        filter_type: FilterType.Radio,
                        db_key: `width`,
                        label: 'Product.Label.Width',
                        options: width.map(el => `${el} mm`),
                        value: param ? Number(param.match(/\d+/)[0]) + ' mm' : null
                      })
                    }

                    if (length?.length) {
                      const param = params?.['filter']?.split(ParamsPrefix.AND)?.find((andParam: string) => andParam.includes('length'))?.split(ParamsPrefix.OR)?.[0]?.split(LinkWord.CONTAINS)?.[1];

                      this.filters.push({
                        filter_type: FilterType.Radio,
                        db_key: `length`,
                        label: 'Product.Label.Length',
                        options: length.map(el => `${el} mm`),
                        value: param ? Number(param.match(/\d+/)[0]) + ' mm' : null
                      })
                    }
                  }
                }
              } else {
                if (labelData?.length) {
                  const data = labelData?.map((el: any) => el[filterKey][0]['value']['label']);

                  this.filters.push({
                    filter_type: filterType === 'multiselect' ? FilterType.Checkbox : FilterType.Radio,
                    db_key: filterKey,
                    label: filterLabel,
                    options: [...new Map(labelData?.map((option: any) => option[filterKey][0]['value']['label']).map((item: any) =>
                      [item['ro'], item])).values()],
                    value: params ? data.filter((category: any) => Object.keys(category).find((key: string) =>
                      params?.['filter']?.split(ParamsPrefix.AND).find((andParam: string) => andParam.includes(filterKey))?.split(ParamsPrefix.OR).find((paramEl: string) => paramEl.split(LinkWord.CONTAINS)[1] === category[key]))) || [] : []
                  })
                }
              }
            }
          })
        }
      }
    }

    // change filters pointer
    this.filters = JSON.parse(JSON.stringify(this.filters));

    this.buildChips();
    this.cdr.detectChanges();
  }

  onSort(event: ProductsSort) {
    if (event === ProductsSort.Cheap2Expensive) {
      this.sortParam = {
        sortBy: ProductsSort.Cheap2Expensive,
        sortOrder: SortTypes.ASC
      }
    } else if (event === ProductsSort.Expensive2Cheap) {
      this.sortParam = {
        sortBy: ProductsSort.Expensive2Cheap,
        sortOrder: SortTypes.DESC
      }
    } else {
      this.sortParam = {
        sortBy: 'created_at',
        sortOrder: SortTypes.DESC
      }
    }

    this.params.page = 1;
    this.qpService.updateParams(getApiParams(this.searchString, this.filterParam, this.sortParam, this.defaultPaging.page, this.defaultPaging.rowsPerPage));
  }

  openFilter(open: boolean) {
    this.isFilterOpen = open;
  }

  filtersChange(event: any) {
    let filterParams: any = [];

    // Every selected category (across ALL product_type dropdowns) is an
    // alternative → OR them together. The previous per-dropdown prefix logic
    // emitted '' whenever the *next* dropdown was empty, and the final pass below
    // turns '' into AND — so categories in non-adjacent groups got AND-joined and
    // returned zero products. Flattening to a single OR list avoids that: only the
    // last category gets '' so the whole category group is AND-ed with other filter
    // types (characteristics/sizes), never with each other.
    const categoryValues: any[] = [];
    Object.keys(event).forEach((key) => {
      if (key.includes('product_type') && Array.isArray(event[key])) {
        event[key].forEach((el: any) => {
          // A category shared by several product_type groups lands in each group's
          // control, so dedupe to avoid a duplicated "cat _or_ cat" clause (and the
          // duplicated chip that produced).
          const value = getLocalized(el);
          if (!categoryValues.includes(value)) categoryValues.push(value);
        });
      }
    });

    categoryValues.forEach((value: any, index: number) => {
      filterParams = [...filterParams, {
        key: 'product_category',
        value,
        linkWord: LinkWord.CONTAINS,
        prefix: index === categoryValues.length - 1 ? '' : ParamsPrefix.OR
      }];
    });

    Object.keys(event).forEach((key: any) => {
      if (!key.includes('product_type') &&
        key !== 'height' &&
        key !== 'width' &&
        key !== 'length') {
        if (event[key]) {
          filterParams = [...filterParams, ...event[key].map((data: any, index: number) => (
            {
              key: key,
              value: getLocalized(data),
              linkWord: LinkWord.CONTAINS,
              prefix: (index === event[key].length - 1) ? '' : ParamsPrefix.OR
            }
          ))];
        }
      }
    })

    if (event['height']?.length) {
      filterParams = [...filterParams, {
        key: 'height',
        value: `${event['height'].split(' ')[0]}`,
        linkWord: LinkWord.CONTAINS,
        prefix: ''
      }
      ];
    }

    if (event['width']?.length) {
      filterParams = [...filterParams, {
        key: 'width',
        value: `${event['width'].split(' ')[0]}`,
        linkWord: LinkWord.CONTAINS,
        prefix: ''
      }
      ];
    }

    if (event['length']?.length) {
      filterParams = [...filterParams, {
        key: 'length',
        value: `${event['length'].split(' ')[0]}`,
        linkWord: LinkWord.CONTAINS,
        prefix: ''
      }
      ];
    }

    filterParams = filterParams.map((filterParam: any, index: number) => ({
      ...filterParam,
      prefix: (index === filterParams.length - 1) ? '' : (filterParam.prefix || ParamsPrefix.AND)
    }))

    this.filterParam = filterParams;
    this.params.page = 1;
    this.qpService.updateParams(getApiParams(this.searchString, this.filterParam, this.sortParam, this.defaultPaging.page, this.defaultPaging.rowsPerPage));
  }

  // Build a "value currency" price string from a product configuration, tolerant
  // of the shapes the API may return: price as an array ([{value,currency}]), an
  // object ({value,currency}) or a bare scalar. Returns '' when there's no usable
  // value so the card simply hides the price instead of showing "undefined".
  private buildPrice(configuration: any, key: 'price' | 'old_price'): string {
    const raw = configuration?.[key];
    const entry = Array.isArray(raw) ? raw[0] : raw;
    const value = (entry && typeof entry === 'object') ? (entry['value'] ?? entry['amount']) : entry;
    if (value === undefined || value === null || value === '') return '';
    const currency = (entry && typeof entry === 'object') ? (entry['currency'] ?? '') : '';
    return `${value} ${currency}`.trim();
  }

  // Parse the numeric part out of a "850 MDL" / "1,200 MDL" price string.
  // Returns null when there's no usable number (empty / "price on request").
  private parsePriceNumber(price?: string): number | null {
    if (!price) return null;
    const match = String(price).replace(/[,\s]/g, '').match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
  }

  // Sort in place by current price. Priced items order by direction; unpriced
  // ("Preț la cerere") always sink to the bottom regardless of direction, so
  // they never sit between priced cards.
  private applyPriceSort(list: any[]): void {
    const dir = this.priceSortOrder === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const pa = this.parsePriceNumber(a?.price?.current);
      const pb = this.parsePriceNumber(b?.price?.current);
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return (pa - pb) * dir;
    });
  }

  getData(params: any) {
    this.productsLoading = true;

    // `id` is a table column rather than a searchable data key, so a purely numeric
    // search term is additionally looked up straight by product id. Only done for the
    // first page — on "load more" the row is already in the list.
    const term = (this.searchString || '').trim();
    const byId$ = !this.saveOld && /^\d+$/.test(term)
      ? this.publicService.getProductById(term).pipe(catchError(() => of(null)))
      : of(null);

    forkJoin([
      this.publicService.getProducts(params),
      byId$
    ]).pipe(takeUntilDestroyed(this.destroy)).subscribe(([response, byId]: [any, any]) => {
      if (response && response.data) {
        const mapProduct = (item: any) => {
          const configuration = findObjectByKey(item.data, 'configurations')?.[0]?.['configuration']?.[0];
          return {
            image: findObjectByKey(item.data, 'images')?.[0]?.['file_url'],
            title: findObjectByKey(item.data, 'title'),
            model: findObjectByKey(item.data, 'model'),
            size: configuration?.['size'],
            sku: findObjectByKey(item.data, 'sku'),
            label: findObjectByKey(item.data, 'product_category')?.[0]?.['value']['label'],
            price: {
              current: this.buildPrice(configuration, 'price'),
              old: this.buildPrice(configuration, 'old_price'),
            },
            isNew: findObjectByKey(item.data, 'is_new'),
            isSale: findObjectByKey(item.data, 'has_sale'),
            outOfStock: findObjectByKey(item.data, 'out_of_stock'),
            comingSoon: findObjectByKey(item.data, 'coming_soon'),
            id: item.id
          };
        };

        const rows = response.data.map(mapProduct);

        const idMatch = byId?.data && !rows.some((row: any) => String(row.id) === String(byId.id))
          ? mapProduct(byId)
          : null;
        if (idMatch) {
          rows.unshift(idMatch);
        }

        const content = (this.saveOld ? this.products.content : []).concat(rows);

        if (this.priceSortOrder) {
          // Whole set fetched → sort once, keep the pool, show only the first page.
          this.applyPriceSort(content);
          this.sortedPool = content;
          const shown = this.defaultPaging.rowsPerPage * this.clientPage;
          this.products = {
            content: this.sortedPool.slice(0, shown),
            total: this.sortedPool.length
          };
        } else {
          this.products = {
            content,
            total: response.meta.total + (idMatch ? 1 : 0)
          };
        }

        this.saveOld = false;
        this.productsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNextPage() {
    // Price sort keeps the full sorted set client-side — just reveal the next
    // slice, no refetch (and no skeleton flash).
    if (this.priceSortOrder && this.sortedPool.length) {
      this.clientPage++;
      const shown = this.defaultPaging.rowsPerPage * this.clientPage;
      this.products = {
        content: this.sortedPool.slice(0, shown),
        total: this.sortedPool.length
      };
      this.cdr.detectChanges();
      return;
    }

    this.params.page++;
    this.saveOld = true;
    this.qpService.updateParams(getApiParams(this.searchString, this.filterParam, this.sortParam, this.params.page, this.defaultPaging.rowsPerPage));
  }
}
