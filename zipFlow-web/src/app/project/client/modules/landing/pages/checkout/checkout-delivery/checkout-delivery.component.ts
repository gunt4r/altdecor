import {Component, DestroyRef, ElementRef, EventEmitter, OnInit, Output} from '@angular/core';
import {InputType, RadioOption} from "../../../../shared/components/custom-input/custom-input.dictionary";
import {
  CheckoutDelivery,
  CheckoutDetails,
  CheckoutInterface,
  CheckoutStage,
  DeliveryMethod,
  DeliveryMethodLabels
} from "../../../../../../../theme/admin/interfaces/checkout.interface";
import {ControlContainer, FormGroupDirective, NonNullableFormBuilder, Validators} from "@angular/forms";
import {FormControls, FormType} from "../../../../shared/helpers/form-controls.helper";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CheckoutService} from "../../../../../../../theme/admin/services/checkout.service";

@Component({
  selector: 'app-checkout-delivery',
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class CheckoutDeliveryComponent implements OnInit {
  @Output() next: EventEmitter<CheckoutStage> = new EventEmitter<CheckoutStage>();
  @Output() prev: EventEmitter<CheckoutStage> = new EventEmitter<CheckoutStage>();

  inputType = InputType;
  // checkoutStage = CheckoutStage.Delivery;
  deliveryMethodsLabels = DeliveryMethodLabels;
  deliveryForm!: FormType<CheckoutDelivery>;
  isJudiciary = false;

  deliveryMethods: RadioOption<DeliveryMethod>[] = [
    {
      active: true,
      value: DeliveryMethod.Address,
      label: this.deliveryMethodsLabels[DeliveryMethod.Address]
    },
    {
      active: false,
      value: DeliveryMethod.Phone,
      label: this.deliveryMethodsLabels[DeliveryMethod.Phone]
    },
    {
      active: false,
      value: DeliveryMethod.Store,
      label: this.deliveryMethodsLabels[DeliveryMethod.Store]
    }
  ]

  constructor(private parent: ControlContainer, private el: ElementRef, private fb: NonNullableFormBuilder, private destroy: DestroyRef) {
  }

  ngOnInit() {
    this.deliveryForm = (this.parent.control as unknown as { controls: FormControls<CheckoutInterface> }).controls.delivery;
    const judiciaryControls = ['companyName', 'address', 'idno', 'tvacode']
    const defaultControls = ['street', 'apartment', 'region', 'zipcode']

    this.addControls(defaultControls);

    this.deliveryForm?.controls?.judiciary?.valueChanges.pipe(takeUntilDestroyed(this.destroy)).subscribe((judiciary) => {
      if (judiciary) {
        this.removeControls(defaultControls);
        this.addControls(judiciaryControls);
      } else {
        this.removeControls(judiciaryControls);
        this.addControls(defaultControls);
      }

      this.isJudiciary = judiciary;
    })
  }

  submit() {

    if (this.deliveryForm.invalid) {
      this.deliveryForm.markAllAsTouched();
      this.scrollToTop();
      return;
    }

    this.next.emit(CheckoutStage.Finish);
  }

  previous() {
    this.prev.emit(CheckoutStage.Details);
  }

  private scrollToTop() {
    this.el.nativeElement?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }

  private removeControls(controls: any[]) {
    controls.forEach((control) => {
      this.deliveryForm.removeControl(control);
    })
  }

  private addControls(controls: any[]) {
    controls.forEach((control) => {
      this.deliveryForm.addControl(control, this.fb.control('', [Validators.required.bind(Validators)]));
    })
  }
}
