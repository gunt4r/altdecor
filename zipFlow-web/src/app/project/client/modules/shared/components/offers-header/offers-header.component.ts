import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {SlickCarouselComponent} from "ngx-slick-carousel";
import {PublicService} from "../../services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-offers-header',
  templateUrl: './offers-header.component.html',
  styleUrl: './offers-header.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class OffersHeaderComponent implements OnInit {
  @Input() margin: string = '50px 50px 80px 40px';
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  offers: any[] = [];
  currentSlideIndex = 0;
  prevSlideIndex = 0;
  isFirstSlide = true;
  isLastSlide = false;
  startAnimation = false;
  animationSpeed = 1000;

  slideConfig = {
    arrows: false,
    infinite: true,
    dots: true,
    autoplay: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplaySpeed: 2000,
    speed: this.animationSpeed,
    customPaging: () => {
      return `<div class="pager__item"></div>`;
    }
  };

  constructor(private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    // if (isPlatformBrowser(this.platformId)) {
      this.publicService.getProductsSlider().subscribe((response: any) => {
        if (response && response.data) {
          this.offers = response.data.map((offer: any) => {
            const productData = findObjectByKey(offer.data, 'product')?.[0];

            return {
              img: findObjectByKey(offer.data, 'img')?.[0]?.['file_url'],
              title: findObjectByKey(offer.data, 'title'),
              availability: findObjectByKey(offer.data, 'availability'),
              description: findObjectByKey(offer.data, 'description'),
              product: productData ? {
                img: productData.img?.[0]?.['file_url'],
                name: productData.name,
                price: productData.price,
                category: productData.category
              } : null
            }
          });

          this.cdr.detectChanges();
        }
      });
    // }
  }

  next() {
    this.slickModal.slickNext();
  }

  prev() {
    this.slickModal.slickPrev();
  }

  beforeChange({currentSlide, nextSlide}: { currentSlide: number, nextSlide: number }) {
    this.currentSlideIndex = currentSlide;

    setTimeout(() => {
      this.currentSlideIndex = nextSlide;
      this.cdr.detectChanges();
    }, this.animationSpeed / 2);

    if (this.prevSlideIndex !== nextSlide) {
      this.startAnimation = true;
      this.prevSlideIndex = nextSlide;
    }
  }

  afterChange({first, last}: { first: boolean, last: boolean }) {
    this.isFirstSlide = first;
    this.isLastSlide = last;
    this.startAnimation = false;
  }
}
