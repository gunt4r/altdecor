import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartProductService {
  private readonly storageKey = 'altdecor-cart';
  private readonly cartItemsSubject = new BehaviorSubject<any[]>(this.readCart());
  readonly cartItemsValue = this.cartItemsSubject.asObservable();
  readonly cartCountValue = new BehaviorSubject<number>(this.cartItemsSubject.value.length);

  addProductToCart(product: any): void {
    const items = [...this.cartItemsSubject.value];
    const existing = items.find((item) => String(item.id) === String(product.id));

    if (existing) {
      existing.quantity = (existing.quantity || 1) + (product.quantity || 1);
    } else {
      items.push(product);
    }

    this.updateCart(items);
  }

  removeProductFromCart(productId: string | number): void {
    this.updateCart(this.cartItemsSubject.value.filter((item) => String(item.id) !== String(productId)));
  }

  clearCart(): void {
    this.updateCart([]);
  }

  private updateCart(items: any[]): void {
    this.cartItemsSubject.next(items);
    this.cartCountValue.next(items.reduce((sum, item) => sum + Number(item.quantity || 1), 0));

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }

  private readCart(): any[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }
}
