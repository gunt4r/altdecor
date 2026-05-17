import {ChangeDetectorRef, Component} from '@angular/core';
import {CartProductService} from "../../../../shared/services/cart-products.service";
import {debounceTime, Subscription, tap} from "rxjs";

@Component({
  selector: 'app-checkout-total',
  templateUrl: './total.component.html',
  styleUrl: './total.component.scss'
})
export class CheckoutTotalComponent {
  labels: {label: string, value: string}[] = []

  total: {label: string, value: string} = {
    label: "Checkout.Total.Label.Total",
    value: ''
  }

  details: { icon: string, title: string, description: string }[] = [
    {
      icon: 'assets/images/content/security.svg',
      title: 'Checkout.Total.Detail.Security.Title',
      description: 'Checkout.Total.Detail.Security.Description'
    },
    {
      icon: 'assets/images/content/delivery2.svg',
      title: 'Checkout.Total.Detail.Delivery.Title',
      description: 'Checkout.Total.Detail.Delivery.Description'
    },
    {
      icon: 'assets/images/content/return.svg',
      title: 'Checkout.Total.Detail.Return.Title',
      description: 'Checkout.Total.Detail.Return.Description'
    }
  ];

  subscriptions: Subscription[] = [];

  constructor(private productService: CartProductService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {;
    this.subscriptions.push(this.productService.cartCountValue.pipe(
      debounceTime(100),
      tap((value: number) => {
        this.getCartData();
    })).subscribe());

    this.getCartData();
  }

  getCartData() {
    const products = this.productService.getCartProducts();
    const totalProducts = products.reduce((total: number, product: any) => total + product.quantity, 0);
    const totalProductPrice = products.reduce((total: number, product: any) => {
      // Split the price string into parts and filter out non-numeric parts
      const priceParts = product.price.split(' ').filter((part: any) => !isNaN(Number(part.replace(/,/g, ''))));
      const priceString = priceParts.join('');
      // Convert the cleaned price string to a number
      const priceNumber = Number(priceString);

      return total + (priceNumber * product.quantity);
    }, 0);

    const currency = 'MDL'
    this.total.value = `${totalProductPrice} ${currency}`;

    this.labels = [
      {
        label: "Checkout.Total.Label.Products",
        value: totalProducts
      },
      {
        label: "Checkout.Total.Label.Subtotal",
        value: `${totalProductPrice} ${currency}`
      },
      // {
      //   label: "Checkout.Total.Label.Vat",
      //   value: "0.00 MDL"
      // },
      // {
      //   label: "Checkout.Total.Label.Delivery",
      //   value: `${delivery} ${currency}`
      // }
    ]

    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subs: any) => subs.unsubscribe());
  }
}
