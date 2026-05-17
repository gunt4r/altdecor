export interface ShopProduct {
  image: string;
  label: string;
  link: string;
}
export interface ShopCategory {
  category: string;
  products: ShopProduct[];
}
