import {Component, Input} from '@angular/core';
import {CheckoutStage} from "../../../../../../../theme/admin/interfaces/checkout.interface";

@Component({
  selector: 'app-checkout-progress',
  templateUrl: './checkout-progress.component.html',
  styleUrl: './checkout-progress.component.scss'
})
export class CheckoutProgressComponent {
  @Input() stage: CheckoutStage = CheckoutStage.Details;

  progresses: Record<CheckoutStage, string> = {
    [CheckoutStage.Details]: 'Checkout.Stage.Details',
    // [CheckoutStage.Delivery]: 'Checkout.Stage.Delivery',
    [CheckoutStage.Finish]: 'Checkout.Stage.Finish'
  }
  progressesList = Object.values(this.progresses);
}
