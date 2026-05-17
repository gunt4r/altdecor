import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewEncapsulation} from '@angular/core';
import {PublicService} from "../../services/public.service";
import {findObjectByKey} from "../../../../../../theme/shared/utils/form.utils";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-masterpieces',
  templateUrl: './masterpieces.component.html',
  styleUrl: './masterpieces.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MasterpiecesComponent implements OnInit{
  masterpieces: any;

  prevSlideIndex = 0;
  currentSlideIndex = 0;
  animationSpeed = 1200;
  startAnimation = false;
  slideConfig = {
    arrows: false,
    infinite: true,
    autoplay: true,
    dots: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: this.animationSpeed,
    autoplaySpeed: 2000,
    customPaging: () => {
      return `<div class="pager__item"></div>`;
    }
  };

  constructor(private publicService: PublicService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    // if(isPlatformBrowser(this.platformId)) {
      this.publicService.getEntertainmentSlider().subscribe((response: any) => {
        if (response && response.data) {
          this.masterpieces = response.data.map((item: any) => {
            return {
              img: findObjectByKey(item.data, 'img')?.[0]?.['file_url'],
              title: findObjectByKey(item.data, 'title'),
              subtitle: findObjectByKey(item.data, 'subtitle'),
              button: findObjectByKey(item.data, 'button'),
              button_link: findObjectByKey(item.data, 'button_link'),
            }
          })
        }
      })
    // }
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

  afterChange() {
    this.startAnimation = false;
  }
}
