import {MetaInterface} from "./meta.interface";
import {CartProduct} from "../../../project/client/modules/shared/interfaces/interfaces";

export enum CheckoutStage {
  Details,
  // Delivery,
  Finish
}

export enum DeliveryMethod {
  Address = 'address',
  Phone = 'phone',
  Store = 'store'
}

export const DeliveryMethodLabels: Record<DeliveryMethod, string> = {
  [DeliveryMethod.Address]: 'Checkout.Delivery.Method.Address',
  [DeliveryMethod.Phone]: 'Checkout.Delivery.Method.Phone',
  [DeliveryMethod.Store]: 'Checkout.Delivery.Method.Store'
}

export interface CheckoutDetails  {
  name?: string;
  surname?: string;
  email?: string;
  // createAccount: boolean;
  password?: string;
  phone?: string;
  repeatPassword?: string;
  termsConditions?: boolean;
}

export interface CheckoutDelivery {
  judiciary: boolean;
  name?: string;
  surname?: string;
  street?: string;
  companyName?: string;
  apartment?: string;
  address?: string;
  city?: string;
  region?: string;
  idno?: string;
  zipcode?: string;
  tvacode?: string;
  country?: string;
  phone?: string;
  deliveryMethod?: DeliveryMethod;
}

export interface TotalLabel {
  value: string,
  label: string
}

export interface CheckoutTotal<T = string> {
  subtotal: T,
  // vat: T,
  total: T
}

export interface CheckoutInterface {
  details: CheckoutDetails,
  delivery: CheckoutDelivery,
  products?: CartProduct[],
  total?: CheckoutTotal,
  code?: string
}

export interface CheckoutListResponse {
  data: CheckoutInterface[]
  meta: MetaInterface
}
