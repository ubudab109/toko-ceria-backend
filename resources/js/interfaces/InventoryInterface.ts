import { UserI } from "./UserInterface";

export interface InventoryProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  measurement?: string;
}

export interface InventoryI {
  id: number;
  name: string;
  product_id?: number;
  price?: number;
  description?: string;
  sku?: string;
  stock: number;
  measurement: string;
  product?: InventoryProduct;
}

export interface InventoryHistoryI {
  id: number;
  inventory_id: number;
  user_id: number;
  user?: UserI;
  title: string;
  description: string;
  type: string;
  previous_value: string;
  current_value: string;
  created_at: Date;
}

export interface StockAdjusmentForm {
  stock: number;
  description: string;
  type: string;
  final_stock: number;
}