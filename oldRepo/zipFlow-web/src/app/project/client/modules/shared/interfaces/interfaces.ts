export interface CartProduct {
  id: number;
  img: string;
  name: string;
  price: number;
  oldPrice: string;
  model: string;
  sku: string;
  description?: string;
  characteristic?: any;
  size: string;
  color: string;
  delivery: number;
  quantity: number;
}
