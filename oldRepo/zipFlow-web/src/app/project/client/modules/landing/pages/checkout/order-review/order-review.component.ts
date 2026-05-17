import {Component, Input} from '@angular/core';
import {CheckoutInterface, DeliveryMethodLabels} from "../../../../../../../theme/admin/interfaces/checkout.interface";

@Component({
  selector: 'app-order-review',
  templateUrl: './order-review.component.html',
  styleUrl: './order-review.component.scss'
})
export class OrderReviewComponent {
  @Input({ required: true }) checkout!: CheckoutInterface;
  deliveryMethodsLabels = DeliveryMethodLabels;
}
