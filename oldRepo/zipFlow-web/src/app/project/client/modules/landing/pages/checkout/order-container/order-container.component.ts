import { Component } from '@angular/core';

@Component({
  selector: 'app-order-container',
  templateUrl: './order-container.component.html',
  styleUrl: './order-container.component.scss'
})
export class OrderContainerComponent {
  details: { icon: string, title: string, description: string }[] = [
    {
      icon: 'assets/images/content/security.svg',
      title: 'Checkout.Total.Detail.Security.Title',
      description: 'Checkout.Total.Detail.Security.Description'
    },
    {
      icon: 'assets/images/content/return.svg',
      title: 'Checkout.Total.Detail.Return.Title',
      description: 'Checkout.Total.Detail.Return.Description'
    }
  ]
}
