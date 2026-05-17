export enum Vat {
  Include = 'include',
  NotInclude = 'not_include'
}

export enum Measure {
  Mm = 'mm'
}

export interface Color {
  image: string;
  name: string;
}

export interface ProductImage {
  id: number;
  path: string;
}

export const VatLabels: Record<Vat, string> = {
  [Vat.Include]: 'Product.Vat.Include',
  [Vat.NotInclude]: 'Product.Vat.NotInclude'
}

export interface ProductSize {
  height: number;
  width: number;
  length: number;
  price: {
    current: string;
    old: string;
  };
  stock: boolean;
}

export interface Product {
  id?: number;
  images: ProductImage[],
  labels: string[];
  title: string;
  price: {
    current: string;
    old: string;
  }
  vat: Vat;
  colors: Color[];
  model: string;
  sku: string;
  type: string;
  material: string;
  characteristic: any;
  sizes: ProductSize[];
  measure: Measure;
  slug: string;
  delivery?: string;
  stock?: boolean;
  isSale?: boolean;
  outOfStock?: boolean;
  isNew?: boolean;
  comingSoon?: boolean;
}
