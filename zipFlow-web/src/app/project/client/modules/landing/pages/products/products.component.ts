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
import {forkJoin, tap} from "rxjs";
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
    if (params.sortBy === ProductsSort.Cheap2Expensive) {
      this.sortParam = {
        sortBy: 'data.5.configurations.0.configuration.0.price.0.value',
        sortOrder: SortTypes.ASC
      }
    } else if (params.sortBy === ProductsSort.Expensive2Cheap) {
      this.sortParam = {
        sortBy: 'data.5.configurations.0.configuration.0.price.0.value',
        sortOrder: SortTypes.DESC
      }
    } else {
      this.sortParam = {
        sortBy: 'created_at',
        sortOrder: SortTypes.DESC
      }
    }

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

    this.params = getApiParams(this.searchParam, apiFilterParams, this.sortParam, params.page || this.defaultPaging.page, params.rowsPerPage || this.defaultPaging.rowsPerPage, false);
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
    (this.filters || []).forEach((f: any) => {
      const val = f.value;
      if (Array.isArray(val)) {
        val.forEach((opt: any) => chips.push({dbKey: f.db_key, option: opt, label: getLocalized(opt) || opt}));
      } else if (typeof val === 'string' && val) {
        chips.push({dbKey: f.db_key, option: val, label: val});
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
    const productTypes = Object.keys(event).filter(key => key.includes('product_type') && event[key]);

    if (productTypes?.length) {
      productTypes.forEach((key, index) => {
        event[key].forEach((el: any, elIndex: number) => {
          filterParams = [...filterParams, {
            key: 'product_category',
            value: getLocalized(el),
            linkWord: LinkWord.CONTAINS,
            prefix: (((index === productTypes.length - 1) && (elIndex === event[key].length - 1)) || ((elIndex === event[key].length - 1) && productTypes[index + 1] && !event[productTypes[index + 1]]?.length)) ? '' : ParamsPrefix.OR
          }]
        })
      });
    }

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

  getData(params: any) {
    this.productsLoading = true;

    this.publicService.getProducts(params).pipe(takeUntilDestroyed(this.destroy)).subscribe(response => {
      if (response && response.data) {
        this.products = {
          content: (this.saveOld ? this.products.content : []).concat(response.data.map((item: any) => {
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
          })),
          total: response.meta.total
        };

        this.saveOld = false;
        this.productsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNextPage() {
    this.params.page++;
    this.saveOld = true;
    this.qpService.updateParams(getApiParams(this.searchString, this.filterParam, this.sortParam, this.params.page, this.defaultPaging.rowsPerPage));
  }
}
