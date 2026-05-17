import {Component, Input} from '@angular/core';
import {Product} from "./product.type";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
  selector: 'app-product-info',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductInfoComponent {
  @Input({transform: coerceBooleanProperty}) cart = false;
  @Input({required: true}) product!: Product;

  initialAmount = 1;

  amount = this.initialAmount;

  currentSizes = 'Option 1';

  getAmount(count: number): void {
    this.amount = count;
  }

  selectedSizes(option: string): void {
    this.currentSizes = option;
  }
}
