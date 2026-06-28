import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {ProductsComponent} from "./products/products.component";
import {PagesComponent} from "./pages.component";
import {PageSlug} from "../../shared/components/page-container/pages.type";
import {ProductPageComponent} from "./product/product.component";
import {CheckoutComponent} from "./checkout/checkout.component";
import {BlogsComponent} from "./blogs/blogs.component";
import {BlogDetailsComponent} from "./blogs/blogs-details/blog-details.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {PortfolioComponent} from "./portfolio/portfolio.component";
import {GalleryComponent} from "./gallery/gallery.component";
import {ContactsComponent} from "./contacts/contacts.component";
import {AboutUsComponent} from "./about-us/about-us.component";
import {FAQComponent} from "../faq/faq.component";

const appRoutes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: PageSlug.Products,
        component: ProductsComponent
      },
      {
        path: PageSlug.Checkout,
        component: CheckoutComponent
      },
      {
        path: PageSlug.Products + '/:' + PageSlug.ProductId,
        component: ProductPageComponent
      },
      {
        path: PageSlug.Blog,
        component: BlogsComponent
      },
      {
        path: PageSlug.Blog + '/:' + PageSlug.BlogId,
        component: BlogDetailsComponent
      },
      {
        path: PageSlug.Portfolio,
        component: PortfolioComponent
      },
      {
        path: PageSlug.Proiecte,
        component: GalleryComponent
      },
      {
        path: PageSlug.Contacts,
        component: ContactsComponent
      },
      {
        path: PageSlug.AboutUs,
        component: AboutUsComponent
      },
      {
        path: PageSlug.Faq,
        component: FAQComponent
      }
    ],
  },
  {
    path: PageSlug.NotFound,
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(
      appRoutes
    )
  ],
  exports: [
    RouterModule,
  ]
})
export class PagesRoutingModule {
}
