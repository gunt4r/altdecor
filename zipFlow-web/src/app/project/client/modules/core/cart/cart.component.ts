import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cart',
  template: `
    <div class="cart-overlay" *ngIf="isCartOpen" (click)="close()"></div>
    <aside class="cart-panel" [class.open]="isCartOpen">
      <div class="cart-panel__head">
        <h3>Cart</h3>
        <button type="button" (click)="close()">×</button>
      </div>
      <p class="cart-panel__empty">Cart preview is enabled. Checkout flows can be restored after the missing source tree is recovered.</p>
    </aside>
  `,
  styles: [`
    .cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:1100}
    .cart-panel{position:fixed;top:0;right:0;width:360px;max-width:100%;height:100%;background:#fff;box-shadow:-10px 0 40px rgba(0,0,0,.18);transform:translateX(100%);transition:transform .25s ease;z-index:1101;padding:24px}
    .cart-panel.open{transform:translateX(0)}
    .cart-panel__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
    .cart-panel__head h3{margin:0}
    .cart-panel__head button{border:0;background:none;font-size:28px;cursor:pointer}
    .cart-panel__empty{margin:0;color:#6a7076;line-height:1.6}
  `]
})
export class CartComponent {
  @Input() isCartOpen = false;
  @Output() isCartOpenChange = new EventEmitter<boolean>();

  close(): void {
    this.isCartOpenChange.emit(false);
  }
}
