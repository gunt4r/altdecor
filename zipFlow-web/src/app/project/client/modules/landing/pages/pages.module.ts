import {NgModule} from '@angular/core';
import {SharedModule} from "../../shared/shared.module";
import {PagesRoutingModule} from "./pages-routing.module";
import {HomeComponent} from "./home/home.component";
import {CommonModule, CurrencyPipe} from "@angular/common";
import {InteriorDivisionsComponent} from "./home/interior-divisions/interior-divisions.component";
import {InteriorDivisionComponent} from "./home/interior-divisions/interior-division/interior-division.component";
import {CoreModule} from "../../core/core.module";
import {TrendingsComponent} from "./home/trendings/trendings.component";
import {TrendingComponent} from "./home/trendings/trending/trending.component";
import {FAQComponent} from "../faq/faq.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {ProductsComponent} from "./products/products.component";
import {PagesComponent} from "./pages.component";
import {ProductsListComponent} from "./products/products-list/products-list.component";
import {ProductsHeaderComponent} from "./products/products-header/products-header.component";
import {ProductPageComponent} from "./product/product.component";
import {ProductComponent} from "./products/product/product.component";
import {ProductSummaryComponent} from "./product/product-summary/product-summary.component";
import {CheckoutComponent} from "./checkout/checkout.component";
import {CheckoutDetailsComponent} from "./checkout/checkout-details/checkout-details.component";
import {CheckoutProgressComponent} from "./checkout/checkout-progress/checkout-progress.component";
import {CheckoutTotalComponent} from "./checkout/total/total.component";
import {CheckoutDeliveryComponent} from "./checkout/checkout-delivery/checkout-delivery.component";
import {CheckoutFinishComponent} from "./checkout/checkout-finish/checkout-finish.component";
import {BlogsComponent} from "./blogs/blogs.component";
import {BlogsListComponent} from "./blogs/blogs-list/blogs-list.component";
import {BlogDetailsComponent} from "./blogs/blogs-details/blog-details.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {OrderReviewComponent} from "./checkout/order-review/order-review.component";
import {OrderContainerComponent} from "./checkout/order-container/order-container.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {ContactsComponent} from "./contacts/contacts.component";
import {ConsultComponent} from "./contacts/consult/consult.component";
import {PortfolioComponent} from "./portfolio/portfolio.component";
import {GalleryComponent} from "./gallery/gallery.component";
import {AboutUsComponent} from "./about-us/about-us.component";
import {ShopComponent} from "./shop/shop.component";

const pages = [
  PagesComponent,
  HomeComponent,
  ProductsComponent,
  ProductPageComponent,
  BlogsComponent,
  CheckoutComponent,
  PageNotFoundComponent,
  ContactsComponent,
  PortfolioComponent,
  GalleryComponent,
  AboutUsComponent,
  ShopComponent
]

const outerComponents = [
  /* Home page components */
  InteriorDivisionsComponent,
  TrendingsComponent,
  FAQComponent,

  /* Products page components */
  ProductComponent,
  ProductsListComponent,
  ProductsHeaderComponent,

  /* Product page components */
  ProductSummaryComponent,

  /* Blogs page components */
  BlogsListComponent,
  BlogDetailsComponent,

  /* Checkout page components */
  CheckoutDetailsComponent,
  CheckoutProgressComponent,
  CheckoutTotalComponent,
  CheckoutDeliveryComponent,
  CheckoutFinishComponent,
  OrderReviewComponent,
  OrderContainerComponent
]

const innerComponents = [
  /* Home page components */
  InteriorDivisionComponent,
  TrendingComponent,
  /* Contacts page components */
  ConsultComponent
]

@NgModule({
  declarations: [...pages, ...innerComponents, ...outerComponents],
  imports: [SharedModule, PagesRoutingModule, CommonModule, CurrencyPipe, CoreModule, MatExpansionModule, ReactiveFormsModule, FormsModule],
  exports: []
})
export class PagesModule {
}
