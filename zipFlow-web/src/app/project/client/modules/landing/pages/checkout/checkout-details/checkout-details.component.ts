import {Component, DestroyRef, ElementRef, EventEmitter, OnInit, Output} from '@angular/core';
import {InputType} from "../../../../shared/components/custom-input/custom-input.dictionary";
import {
  CheckoutDetails,
  CheckoutInterface,
  CheckoutStage
} from "../../../../../../../theme/admin/interfaces/checkout.interface";
import {
  AbstractControl,
  ControlContainer,
  FormGroupDirective,
  NonNullableFormBuilder,
  Validators
} from "@angular/forms";
import {FormControls, FormType} from "../../../../shared/helpers/form-controls.helper";
import {CartProduct} from "../../../../shared/interfaces/interfaces";
import {CartProductService} from "../../../../shared/services/cart-products.service";
import {debounceTime, Subscription, tap} from "rxjs";

@Component({
  selector: 'app-checkout-details',
  templateUrl: './checkout-details.component.html',
  styleUrl: './checkout-details.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class CheckoutDetailsComponent implements OnInit {
  @Output() next: EventEmitter<CheckoutStage> = new EventEmitter<CheckoutStage>();

  inputType = InputType;
  products: CartProduct[] = [];

  checkoutStage = CheckoutStage.Details;
  detailsForm!: FormType<CheckoutDetails>;
  // createAccount: boolean = false;

  benefits: { icon: string, label: string }[] = [
    {
      icon: 'assets/images/content/time.svg',
      label: 'Achitare cu doar 1 click'
    },
    {
      icon: 'assets/images/content/coins.svg',
      label: 'Puncte de loialitate la fiecare achiziționare'
    },
    {
      icon: 'assets/images/content/rewards.svg',
      label: 'Program complet de loialitate'
    },
    {
      icon: 'assets/images/content/heart.svg',
      label: 'Gestionezi lista de dorințe oricând'
    }
  ]

  subscriptions: Subscription[] = [];

  constructor(private parent: ControlContainer, private productService: CartProductService, private el: ElementRef, private destroy: DestroyRef, private fb: NonNullableFormBuilder) {
  }

  ngOnInit() {
    this.products = this.productService.getCartProducts();

    this.detailsForm = (this.parent.control as unknown as { controls: FormControls<CheckoutInterface> }).controls.details;
    this.detailsForm.addControl('termsConditions', this.fb.control(false, [Validators.requiredTrue.bind(Validators)]));

    this.subscriptions.push(this.productService.cartCountValue.pipe(
      debounceTime(100),
      tap(() => {
      this.products = this.productService.getCartProducts();
    })).subscribe());

    // this.detailsForm.controls.createAccount.valueChanges.pipe(takeUntilDestroyed(this.destroy)).subscribe((create) => {
    //   if (create) {
    //     this.detailsForm.addControl('password', this.fb.control('', [Validators.required.bind(Validators)]))
    //     this.detailsForm.addControl('repeatPassword', this.fb.control('', [Validators.required.bind(Validators), this.patternValidator.bind(this)]))
    //   } else this.removeControls(['password', 'repeatPassword']);
    //
    //   this.createAccount = create;
    // })
  }

  submit() {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      this.scrollToTop();
      return;
    }
    // const form = this.detailsForm.getRawValue();

    // if (form.createAccount) {
    //   const {email, password} = form;
    //   // TODO: Add Create account endpoint
    // }

    // this.removeControls(['termsConditions', 'createAccount']);
    this.removeControls(['termsConditions']);

    this.next.emit(CheckoutStage.Finish);
  }

  private scrollToTop() {
    this.el.nativeElement?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }

  patternValidator(control: AbstractControl) {
    const sourceValue = this.detailsForm.get('password')?.value;

    if (sourceValue !== control.value) return {pattern: 'Validators.NotEqualPassword'};

    return null;
  }

  private removeControls(controls: any[]) {
    controls.forEach((control) => {
      this.detailsForm.removeControl(control);
    })
  }

  counterChange(event: any, product: any) {
    this.productService.addProductToCart(product, event || 1);
    this.products = this.productService.getCartProducts();
  }

  deleteProduct(product: any) {
    this.productService.deleteCartProduct(product);
    this.products = this.productService.getCartProducts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subs: any) => subs.unsubscribe());
  }
}
