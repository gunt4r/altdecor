import {Component} from '@angular/core';
import {Entities, PolicyActions} from "../../../dictionary/permissions.dictionary";
import {EntityService} from "../../../services/entity.service";
import {Router} from "@angular/router";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: any;
  class: string;
  entity?: Entities;
  action?: PolicyActions;
  children?: any[]
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems: RouteInfo[] = [
    // {
    //   path: '/admin/crud',
    //   title: 'Application Data',
    //   icon: 'squares-pie.svg',
    //   class: '',
    //   // entity: Entities.WIDGET,
    //   // action: PolicyActions.VIEW
    // },
    {
      path: '/admin/languages',
      title: 'Languages',
      icon: 'language.svg',
      class: '',
      // entity: Entities.WIDGET,
      // action: PolicyActions.VIEW
    },
    {
      path: '/admin/images',
      title: 'Images',
      icon: 'images.svg',
      class: '',
      // entity: Entities.WIDGET,
      // action: PolicyActions.VIEW
    },
    {
      path: '/admin/email-sender',
      title: 'Newsletter',
      icon: 'email-sender.svg',
      class: '',
      // entity: Entities.WIDGET,
      // action: PolicyActions.VIEW
    },
    {
      path: '/admin/analytics',
      title: 'Analytics',
      icon: 'analytics.svg',
      class: '',
      // entity: Entities.WIDGET,
      // action: PolicyActions.VIEW
    },
    {
      path: '/admin/checkout',
      title: 'Checkout',
      icon: 'checkout.svg',
      class: '',
      // entity: Entities.WIDGET,
      // action: PolicyActions.VIEW
    },
    {
      path: '/admin/entities',
      title: 'Dynamic entities',
      icon: 'pie-chart.svg',
      class: '',
      // entity: Entities.ENTITY,
      // action: PolicyActions.VIEW
    },
  ];

  openedItems: { [key: string]: boolean } = {};

  constructor(private entitiesService: EntityService,
              private router: Router) {
  }

  async ngOnInit() {
    const entities = await this.entitiesService.getCrudList();
    // YEAH BBY IT'S HARDCODED!!
    this.menuItems = [
      {
        path: '/admin/crud',
        title: 'Products Data',
        icon: 'squares-pie.svg',
        class: '',
        children: entities.filter((entity: any) =>
          entity.slug === 'product' ||
          // entity.slug === 'products_slider' ||
          entity.slug === 'product_type' ||
          entity.slug === 'product_categories' ||
          entity.slug === 'product_material' ||
          entity.slug === 'categories_banner'
        )
          .map(entity => ({...entity, path: entity.slug, title: entity.label}))
      },
      {
        path: '/admin/crud',
        title: 'Blogs Data',
        icon: 'squares-pie.svg',
        class: '',
        children: entities.filter((entity: any) =>
          entity.slug === 'blogs' ||
          entity.slug === 'blog_category')
          .map(entity => ({...entity, path: entity.slug, title: entity.label}))
      },
      {
        path: '/admin/crud',
        title: 'Widgets Data',
        icon: 'squares-pie.svg',
        class: '',
        children: entities.filter((entity: any) =>
          entity.slug === 'advantages' ||
          entity.slug === 'entertainment_slider' ||
          entity.slug === 'faq')
          .map(entity => ({...entity, path: entity.slug, title: entity.label}))
      },
      {
        path: '/admin/crud',
        title: 'Pages Data',
        icon: 'squares-pie.svg',
        class: '',
        children: entities.filter((entity: any) =>
          entity.slug === 'portfolio' ||
          entity.slug === 'about_us' ||
          entity.slug === 'general_details')
          .map(entity => ({...entity, path: entity.slug, title: entity.label}))
      },
      {
        path: '/admin/crud',
        title: 'Contacts',
        icon: 'squares-pie.svg',
        class: '',
        children: entities.filter((entity: any) =>
          entity.slug === 'phone' ||
          entity.slug === 'email')
          .map(entity => ({...entity, path: entity.slug, title: entity.label}))
      },
      {
        path: '/admin/crud',
        title: 'Pages Meta',
        icon: 'squares-pie.svg',
        class: '',
        children: entities.filter((entity: any) =>
          entity.slug === 'meta')
          .map(entity => ({...entity, path: entity.slug, title: entity.label}))
      },
      {
        path: '/admin/crud',
        title: 'Configurations',
        icon: 'squares-pie.svg',
        class: '',
        children: entities.filter((entity: any) =>
          entity.slug === 'filter_type')
          .map(entity => ({...entity, path: entity.slug, title: entity.label}))
      },
      ...this.menuItems
    ]

    this.menuItems.forEach((el, index) => {
      if (this.router.url.includes(el.path)) {
        this.showSubMenu(index);
      }
    })
  }

  showSubMenu(index: number) {
    this.openedItems[index] = !this.openedItems[index]
  }
}
