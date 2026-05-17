import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CartProductService} from "../../services/cart-products.service";
import {Router} from "@angular/router";
import {formatPrice} from "../../utils/formatPrice.utils";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnChanges {
  @Input() isCartOpen: boolean = false;
  @Output() isCartOpenChange = new EventEmitter<boolean>();

  isFullCart: boolean = false;
  products: any[] = [];
  totalProductPrice: number = 0;
  totalDeliveryPrice: number = 0;
  totalCost: number = 0;
  isHovered: boolean[] = [];
  totalProducts = 0;
  currency: string = 'MDL';

  constructor(private productService: CartProductService, private router: Router) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['isCartOpen']?.currentValue !== changes?.['isCartOpen']?.previousValue) {
      this.getCartData();
    }
  }

  getCartData() {
    this.products = this.productService.getCartProducts();
    this.totalProducts = this.products.reduce((total, product) => total + product.quantity, 0);
    this.isFullCart = this.products.length > 0;
    this.calculateTotalPrice();
  }

  private calculateTotalPrice(): void {
    this.totalProductPrice = this.products.reduce((total: number, product: any) => {
      // Split the price string into parts and filter out non-numeric parts
      const priceParts = product.price.split(' ').filter((part: any) => !isNaN(Number(part.replace(/,/g, ''))));
      const priceString = priceParts.join('');
      // Convert the cleaned price string to a number
      const priceNumber = Number(priceString);

      return total + (priceNumber * product.quantity);
    }, 0);

   // this.totalDeliveryPrice = this.products.reduce((total, product) => total + product.delivery, 0);
    this.totalCost = this.totalProductPrice + this.totalDeliveryPrice;
  }

  closeCart(): void {
    this.isCartOpen = !this.isCartOpen;
    this.isCartOpenChange.emit(this.isCartOpen);
  }

  showDeleteButton(index: number) {
    this.isHovered[index] = true;
  }

  hideDeleteButton(index: number) {
    this.isHovered[index] = false;
  }

  deleteProduct(product: any) {
    this.productService.deleteCartProduct(product);
    this.getCartData();
  }

  checkout() {
    this.router.navigate(['./checkout']).then(() => {
      this.closeCart();
    })
  }

  counterChange(event: any, product: any) {
    this.productService.addProductToCart(product, event || 1);
    this.getCartData();
  }

  formatPrice(price: string): string {
    return formatPrice(price);
  }
}
