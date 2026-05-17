import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DestroyRef,
  EventEmitter,
  Inject,
  OnInit,
  PLATFORM_ID,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {CheckoutStage} from "../../../../../../theme/admin/interfaces/checkout.interface";
import {CheckoutDetailsComponent} from "./checkout-details/checkout-details.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CheckoutFinishComponent} from "./checkout-finish/checkout-finish.component";
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import {MetaService} from "../../../shared/services/meta.service";
import {Router} from "@angular/router";
import {CartProductService} from "../../../shared/services/cart-products.service";
import {CartProduct} from "../../../shared/interfaces/interfaces";
import {PageSlug} from "../../../shared/components/page-container/pages.type";
import {phoneNumberValidator} from "../../../shared/validators/phone.validator";
import {isPlatformBrowser} from "@angular/common";
import {debounceTime, Subscription, tap} from "rxjs";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  @ViewChild('checkout', {static: true, read: ViewContainerRef}) checkout!: ViewContainerRef;
  form: any;

  currentStage = CheckoutStage.Details;
  products: CartProduct[] = [];
  pages = PageSlug;
  private componentRef: Map<CheckoutStage, ComponentRef<unknown> | null> = new Map([]);

  subscriptions: Subscription[] = [];

  constructor(private meta: MetaService,
              private router: Router,
              private destroy: DestroyRef,
              private fb: NonNullableFormBuilder,
              private productService: CartProductService,
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    this.meta.getMeta(this.router.url)

    if (isPlatformBrowser(this.platformId)) {
      this.form = this.fb.group<any>({
        details: this.fb.group({
          name: this.fb.control(''),
          surname: this.fb.control(''),
          email: this.fb.control('', [Validators.email.bind(Validators)]),
          phone: this.fb.control('', [Validators.minLength(5), Validators.required.bind(Validators),
            phoneNumberValidator().bind(this)]),
          // createAccount: this.fb.control(false, [])
        }),
        // delivery: this.fb.group({
        //   judiciary: this.fb.control(false, []),
        //   name: this.fb.control('', [Validators.required.bind(Validators)]),
        //   surname: this.fb.control('', [Validators.required.bind(Validators)]),
        //   city: this.fb.control('', [Validators.required.bind(Validators)]),
        //   country: this.fb.control('', [Validators.required.bind(Validators)]),
        //   phone: this.fb.control('', [Validators.minLength(5),
        //     phoneNumberValidator().bind(this)]),
        //   deliveryMethod: this.fb.control(DeliveryMethod.Address, [Validators.required.bind(Validators)])
        // })
      })
      this.createCheckoutComponent();

      this.subscriptions.push(this.productService.cartCountValue.pipe(
        debounceTime(100),
        tap((value: number) => {
          this.products = this.productService.getCartProducts();
          this.cdr.detectChanges();
        })).subscribe());
    }
  }

  private getCheckoutStage(): Type<unknown> {
    switch (this.currentStage) {
      case CheckoutStage.Details:
        return CheckoutDetailsComponent;
      // case CheckoutStage.Delivery:
      //   return CheckoutDeliveryComponent;
      case CheckoutStage.Finish:
        return CheckoutFinishComponent;
      default:
        return CheckoutDetailsComponent
    }
  }

  private createCheckoutComponent() {
    if (this.componentRef?.has(this.currentStage)) {
      this.componentDisplay('block');
    } else {
      this.componentRef.set(this.currentStage, this.checkout.createComponent(this.getCheckoutStage()));
    }

    const componentInstance = this.componentRef.get(this.currentStage)?.instance as { next: EventEmitter<CheckoutStage>, prev: EventEmitter<CheckoutStage> };

    this.componentRef.get(this.currentStage)

    if ('next' in componentInstance) {
      componentInstance.next.pipe(takeUntilDestroyed(this.destroy)).subscribe((stage: CheckoutStage) => {
        this.componentDisplay('none');
        this.currentStage = stage;
        this.createCheckoutComponent();
      });
    }

    if ('prev' in componentInstance) {
      componentInstance.prev.pipe(takeUntilDestroyed(this.destroy)).subscribe((stage: CheckoutStage) => {
        this.componentDisplay('none');
        this.currentStage = stage;
        this.createCheckoutComponent();
      });
    }
  }

  private componentDisplay(display: 'block' | 'none') {
    const componentElement = this.componentRef.get(this.currentStage)?.location.nativeElement;
    componentElement.scrollIntoView({behavior: 'smooth', block: 'start'})
    componentElement.style.display = display;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subs: any) => subs.unsubscribe());
  }
}
