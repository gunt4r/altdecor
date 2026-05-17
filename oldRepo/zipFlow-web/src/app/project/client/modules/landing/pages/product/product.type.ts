import {Type} from "@angular/core";

export enum ProductTab {
  Description = 'description',
  Material = 'material',
  Delivery = 'delivery'
}

export const ProductTabLabel: Record<ProductTab, string> = {
  [ProductTab.Description]: 'ProductPage.Summary.Tab.Description',
  [ProductTab.Material]: 'ProductPage.Summary.Tab.Material',
  [ProductTab.Delivery]: 'ProductPage.Summary.Tab.Delivery'
}

export interface ProductSummary {
  tab: ProductTab,
  component: Type<unknown>
}
