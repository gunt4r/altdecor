// TODO: Sync with categories from Back
export enum ProductCategory {
  All = 'all',
  Wood = 'wood',
  Pvc = 'pvc',
  Marble = 'marble',
  SmartTechnique = 'smart_technique'
}

export interface Product {
  id: string;
  image: string;
  label: string;
  title: string;
  price: string;
}
