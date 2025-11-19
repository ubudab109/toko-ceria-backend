import { OrderStatus } from "@/types/order";
import { CustomerI } from "./CustomerInterface";
import { ProductI } from "./ProductInterface";

export interface OrderStatusDescriptionI {
  status: string;
  desc: string;
  className: string;
  key: OrderStatus;
}

export interface OrderStatusI {
  value: OrderStatus;
  label: string;
}

export interface ProductOrderI {
  id: number;
  product_id: number;
  order_id: number;
  product: ProductI;
  quantity: number;
  is_deleted?: boolean;
}

export interface OrderI {
  id: number;
  order_number: string;
  customer_id: number;
  total: number;
  checkout_type: string;
  status: OrderStatus;
  product_orders: ProductOrderI[];
  customer: CustomerI;
  created_at?: Date | string;
  notes?: string | null;
}