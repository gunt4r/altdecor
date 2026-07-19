import { Injectable } from '@angular/core';
import {CartProduct} from "../interfaces/interfaces";
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "./translate.service";
import {BehaviorSubject} from "rxjs";
import * as _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class CartProductService {
  cartCountValue: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private toastr: ToastrService, private translate: TranslateService) {}

  addProductToCart(product: any, quantity?: number) {
    let storageProducts: any = localStorage.getItem('cart_products');

    if(!storageProducts) {
      storageProducts = [];
    } else {
      storageProducts = JSON.parse(storageProducts);
    }

    if(storageProducts) {
      let sameProduct = storageProducts.find((el: any) => el.id === product.id && el.price === product.price && el.size === product.size);
      if(sameProduct) {
        sameProduct.quantity = quantity || (sameProduct.quantity + product.quantity);
      } else {
        storageProducts.push(product);
      }

      this.cartCountValue.next(storageProducts.reduce((total: number, newProduct: any) => total + newProduct.quantity, 0) || 0);

      localStorage.setItem('cart_products', JSON.stringify(storageProducts));

      if(!quantity) {
        const text = _.get(this.translate.data, 'Cart.AddedToastText') || 'Product added to your cart.';
        const title = _.get(this.translate.data, 'Cart.AddedToastTitle') || 'Added to cart';
        this.toastr.success(text, title);
      }
    }
  }

  deleteCartProduct(product: any) {
    let storageProducts: any = localStorage.getItem('cart_products');

    if(storageProducts) {
      storageProducts = JSON.parse(storageProducts);

      storageProducts = storageProducts.filter((el: any) => !(el.id === product.id && el.price === product.price && el.size === product.size));
      localStorage.setItem('cart_products', JSON.stringify(storageProducts));
    }
  }

  getCartProducts(): any {
    const products = localStorage.getItem('cart_products');
    this.cartCountValue.next(products ? JSON.parse(products).reduce((total: number, newProduct: any) => total + newProduct.quantity, 0) : 0);
    return products ? JSON.parse(products) : [];
  }
}
