import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {Product} from "./recommendations.type";
import {SlickCarouselComponent} from "ngx-slick-carousel";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {isPlatformBrowser} from "@angular/common";
import {PublicService} from "../../services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {forkJoin, tap} from "rxjs";

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrl: './recommendations.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RecommendationsComponent implements OnInit {
  @Input({transform: coerceBooleanProperty}) filters = false;
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  language = localStorage.getItem('language') || 'ro';

  isMobile: boolean = false;
  isTablet: boolean = false;

  config = {
    title: "Recommendations.Title",
    button: {
      all: "Recommendations.Button.All",
      catalogue: "Recommendations.Button.Catalogue"
    }
  }

  productCategories: any = [];

  activeCategory = 0;
  products: any = [];

  slidesToShow: number = 3;
  centerPadding: string = '250px';
  slideConfig: any;

  isFirstSlide = true;
  isLastSlide = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private publicService: PublicService,
              private cdr: ChangeDetectorRef) {
    this.getSlideConfig();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getSlideConfig();
  }

  getSlideConfig() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 821;
      this.isTablet = window.innerWidth < 1025 && window.innerWidth > 821;
      this.slidesToShow = this.isMobile ? 1 : (this.isTablet ? 2 : 3);
      const centerMode = this.products.length > this.slidesToShow;
      this.centerPadding = this.isMobile ? '70px' : '250px';

      this.slideConfig = {
        arrows: false,
        infinite: true,
        animationSpeed: 1500,
        slidesToShow: this.slidesToShow,
        slidesToScroll: 1,
        centerMode: centerMode,
        centerPadding: this.centerPadding,
      };
    }
  }

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)) {
      this.getSlideConfig();
      this.getData();
    }
  }

  getData() {
    this.publicService.getProductCategories({filter: 'main_contains_true'}).subscribe((data: any) => {
      this.productCategories = [
        {
          key: 'Recommendations.Button.All',
          products: []
        }
      ];
      const serverCategories: any = [];

      data.data?.forEach((el: any) => {
        this.productCategories.push({
          key: findObjectByKey(el.data, 'label'),
          products: []
        });
        serverCategories.push(findObjectByKey(el.data, 'label'));
      });

      forkJoin(serverCategories.map((el: any) => this.publicService.getProducts({filter: `product_category_contains_${el[this.language]}`}))).pipe(
        tap((productsData: any) => {
          productsData.forEach((productData: any, index: number) => {
            this.productCategories[index + 1].products = this.filterUniqueById(productData.data.map((product: any) => ({
              id: product.id,
              image: findObjectByKey(product.data, 'images')[0]?.['file_url'],
              label: findObjectByKey(product.data, 'product_type')?.[0]?.['value']?.['label'],
              title: findObjectByKey(product.data, 'title'),
              price: `${findObjectByKey(product.data, 'configurations')?.[0]['configuration']?.[0]?.['price']?.[0]?.['value']} ${findObjectByKey(product.data, 'configurations')?.[0]['configuration']?.[0]?.['price']?.[0]?.['currency']}`
            })))
          });

          this.productCategories = this.productCategories.filter((el: any, index: number) => el.products.length || index === 0)?.slice(0, 6);
          this.productCategories.forEach((productCategory: any) => {
            this.productCategories[0].products = [
              ...this.productCategories[0].products,
              ...productCategory.products
            ]
          });

          this.products = this.productCategories[0].products;
          this.cdr.detectChanges();
        }),
      ).subscribe();
    });
  }

  filterUniqueById(array: any) {
    const seenIds = new Set();
    return array.reduce((uniqueArray: any, currentObject: any) => {
      if (!seenIds.has(currentObject.id)) {
        seenIds.add(currentObject.id);
        uniqueArray.push(currentObject);
      }
      return uniqueArray;
    }, []);
  }

  filterByCategory(index: number) {
    this.activeCategory = index;

    this.products = this.productCategories[index].products;
  }

  next() {
    this.slickModal.slickNext();
  }

  prev() {
    this.slickModal.slickPrev();
  }

  afterChange({first, last}: { first: boolean, last: boolean }) {
    this.isFirstSlide = first;
    this.isLastSlide = last;
  }
}
