export interface Product {
  image: string;
  title: string;
  label: string;
  model?: string;
  size?: string;
  sku?: string;
  characteristic?: any;
  price: {
    current: string;
    old?: string;
  };
  isNew?: boolean;
  isSale?: boolean;
  id: string;
  outOfStock?: boolean;
  comingSoon?: boolean;
}

export interface Products {
  content: Product[];
  total: number;
  limit: number;
}
