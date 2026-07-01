import {Component, Input} from '@angular/core';
import {Product} from "../products.type";
import {Badge} from "../../../../shared/components/badge/badge.type";
import {CartProductService} from "../../../../shared/services/cart-products.service";
import {FileSnippet} from "../../../../../../../theme/admin/interfaces/file-snippet.interface";
import {Dialog} from "@angular/cdk/dialog";
import {ZoomImageComponent} from "../../../../shared/components/zoom-image/zoom-image.component";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  @Input({required: true}) product!: Product;

  badge = Badge;

  constructor(private cartService: CartProductService, private dialog: Dialog) {
  }

  // Vertical dimension chip shown on the card image (e.g. "2800 mm"). Sizes come
  // as "970x2800x4" / "970*2800*4" etc; the principal (largest) dimension is the
  // panel height shown in the design. Empty when there's no usable size.
  get dimensionLabel(): string {
    const nums = String(this.product.size ?? '').match(/\d+/g)?.map(Number) ?? [];
    if (!nums.length) return '';
    return `${Math.max(...nums)} mm`;
  }

  private isValidPrice(value?: string): boolean {
    return !!value && !/undefined|null|nan/i.test(value);
  }

  get hasOldPrice(): boolean {
    return this.isValidPrice(this.product.price?.old)
      && this.product.price.old !== this.product.price.current;
  }

  get hasPrice(): boolean {
    return this.isValidPrice(this.product.price?.current);
  }

  addToCart() {
    this.cartService.addProductToCart(
      {
        id: this.product.id,
        img: this.product.image,
        name: this.product.title,
        price: this.product.price.current,
        oldPrice: this.product.price.old || '',
        model: this.product.model,
        quantity: 1,
        size: this.product.size,
        sku: this.product.sku,
        characteristic: this.product.characteristic
      }
    );
  }

  showImage(image: string) {
    this.dialog.open(ZoomImageComponent, {
      data: { images: [image] }
    })
  }
}
