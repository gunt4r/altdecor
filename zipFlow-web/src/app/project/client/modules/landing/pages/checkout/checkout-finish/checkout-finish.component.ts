import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ControlContainer, FormGroupDirective} from "@angular/forms";
import {
  CheckoutInterface,
  CheckoutTotal,
  DeliveryMethodLabels, TotalLabel
} from "../../../../../../../theme/admin/interfaces/checkout.interface";
import {CartProductService} from "../../../../shared/services/cart-products.service";
import {CartProduct} from "../../../../shared/interfaces/interfaces";
import {CheckoutService} from "../../../../../../../theme/admin/services/checkout.service";

@Component({
  selector: 'app-checkout-finish',
  templateUrl: './checkout-finish.component.html',
  styleUrl: './checkout-finish.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class CheckoutFinishComponent implements OnInit {
  orderId = '';

  form!: CheckoutInterface;
  products: CartProduct[] = [];
  deliveryMethodsLabels = DeliveryMethodLabels;
  email = 'support@gardecor.md';

  // @ts-ignore
  labels: CheckoutTotal<TotalLabel>;

  constructor(private formParent: FormGroupDirective, private productService: CartProductService, private checkoutService: CheckoutService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.formParent.form) this.form = this.formParent.form?.getRawValue() as CheckoutInterface;

    const products = this.productService.getCartProducts();
    this.products = products;
    const totalProductPrice = products.reduce((total: number, product: any) => {
      // Split the price string into parts and filter out non-numeric parts
      const priceParts = product.price.split(' ').filter((part: any) => !isNaN(Number(part.replace(/,/g, ''))));
      const priceString = priceParts.join('');
      // Convert the cleaned price string to a number
      const priceNumber = Number(priceString);

      return total + (priceNumber * product.quantity);
    }, 0);
    const currency = 'MDL';

    this.labels = {
      subtotal: {
        label: "Checkout.Total.Label.Subtotal",
        value: `${totalProductPrice} ${currency}`
      },
      // vat: {
      //   label: "Checkout.Total.Label.Vat",
      //   value: "0.00 MDL"
      // },
      // delivery: {
      //   label: "Checkout.Total.Label.Delivery",
      //   value: `${delivery} ${currency}`
      // },
      total: {
        label: "Checkout.Total.Label.Total",
        value: `${totalProductPrice} ${currency}`
      }
    }

    const data: CheckoutInterface = {
      ...this.form,
      products: this.products,
      total: Object.fromEntries(Object.entries(this.labels).map(([key, value]) => [key, value.value])) as CheckoutTotal
    };

    this.checkoutService.create(data).then(({code}) => {
      if (code) this.orderId = code;
      this.cdr.detectChanges();
    });
  }
}
