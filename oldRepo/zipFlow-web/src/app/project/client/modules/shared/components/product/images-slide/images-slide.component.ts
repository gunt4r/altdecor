import {Component, Input} from '@angular/core';
import {ProductImage} from "../product.type";
import {Badge} from "../../badge/badge.type";
import {ZoomImageComponent} from "../../zoom-image/zoom-image.component";
import {Dialog} from "@angular/cdk/dialog";

@Component({
  selector: 'app-images-slide',
  templateUrl: './images-slide.component.html',
  styleUrl: './images-slide.component.scss'
})
export class ImagesSlideComponent {
  @Input({required: true}) images!: ProductImage[];
  @Input() sale?: unknown = false;
  @Input() outOfStock?: unknown = false;
  @Input() isNew?: unknown = false;
  @Input() comingSoon?: unknown = false;

  badge = Badge;

  imageIndex = 0;
  animationSpeed = 1200;
  startAnimation = false;

  constructor(private dialog: Dialog) {
  }

  changeImage(index: number) {
    // this.startAnimation = false;

    // setTimeout(() => {
    this.imageIndex = index;
    // }, this.animationSpeed / 2);


    // setTimeout(() => {
    //   this.startAnimation = false;
    // }, this.animationSpeed);

    // if (this.imageIndex !== index) this.startAnimation = true;
  }

  showImages(activeIndex: number) {
    const images = this.images.map((image) => image.path);

    this.dialog.open(ZoomImageComponent, {
      data: {images, activeIndex}
    })
  }
}
