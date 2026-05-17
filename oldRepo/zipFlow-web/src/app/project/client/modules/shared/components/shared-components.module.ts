import {NgModule} from '@angular/core';
import {CounterComponent} from "./counter/counter.component";
import {SelectComponent} from "./select/select.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SharedPipesModule} from "../pipes/shared-pipes.module";
import {SpecificationsComponent} from "./specifications/specifications.component";
import {SpecificationComponent} from "./specifications/specification/specification.component";
import {RouterModule} from "@angular/router";
import {BadgeComponent} from "./badge/badge.component";
import {PageContainerComponent} from "./page-container/page-container.component";
import {ContactBannerComponent} from "./contact-banner/contact-banner.component";
import {CartComponent} from "./cart/cart.component";
import {MasterpiecesComponent} from "./masterpieces/masterpieces.component";
import {SlickCarouselModule} from "ngx-slick-carousel";
import {RecommendationsComponent} from "./recommendations/recommendations.component";
import {RecommendationComponent} from "./recommendations/recommendation/recommendation.component";
import {ImagesSlideComponent} from "./product/images-slide/images-slide.component";
import {ProductDetailsComponent} from "./product/product-details/product-details.component";
import {ProductInfoComponent} from "./product/product.component";
import {CustomInputComponent} from "./custom-input/custom-input.component";
import {ShareOptionsComponent} from "./share-options/share-options.component";
import {BlogRecommendationComponent} from "./blog-recommendation/blog-recommendation.component";
import {ValidationErrorsComponent} from "./validation-errors/validation-errors.component";
import {ReviewContainerComponent} from "./review-container/review-container.component";
import {OffersHeaderComponent} from "./offers-header/offers-header.component";
import {DialogContainerComponent} from "./dialog-container/dialog-container.component";
import {FiltersComponent} from "./filters/filters.component";
import {DropdownComponent} from "./filters/components/dropdown/dropdown.component";
import {CheckboxComponent} from "./filters/components/checkbox/checkbox.component";
import {RadioComponent} from "./filters/components/radio/radio.component";
import {SingleFilterComponent} from "./filters/components/single-filter/single-filter.component";
import {LoaderComponent} from "./loader/loader.component";
import {MainProductsSectionComponent} from "./main-products-section/main-products-section.component";
import {CustomMapComponent} from "./custom-map/custom-map.component";
import {ZoomImageComponent} from "./zoom-image/zoom-image.component";

const innerComponents = [
  SpecificationComponent,
  RecommendationComponent,
  ImagesSlideComponent,
  ProductDetailsComponent,

  // For Filters Component
  DropdownComponent,
  CheckboxComponent,
  RadioComponent,
  SingleFilterComponent
]

const components = [
  PageContainerComponent,
  BadgeComponent,
  CounterComponent,
  SelectComponent,
  SpecificationsComponent,
  ContactBannerComponent,
  CartComponent,
  MasterpiecesComponent,
  RecommendationsComponent,
  ProductInfoComponent,
  CustomInputComponent,
  ShareOptionsComponent,
  BlogRecommendationComponent,
  ValidationErrorsComponent,
  ReviewContainerComponent,
  OffersHeaderComponent,
  DialogContainerComponent,
  FiltersComponent,
  LoaderComponent,
  MainProductsSectionComponent,
  CustomMapComponent,
  ZoomImageComponent
]

@NgModule({
  imports: [FormsModule, CommonModule, SharedPipesModule, RouterModule, SlickCarouselModule, ReactiveFormsModule],
  declarations: [...components, ...innerComponents],
  exports: [...components, ...innerComponents]
})
export class SharedComponentsModule {
}
