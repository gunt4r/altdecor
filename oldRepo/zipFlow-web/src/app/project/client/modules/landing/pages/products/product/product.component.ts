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
