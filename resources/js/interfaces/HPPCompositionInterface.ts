import { InventoryI } from "./InventoryInterface";
import { UserI } from "./UserInterface";

export interface HPPCompositionCategoryI {
  id: number;
  hpp_composition_id: number;
  category_name: string;
  is_deleted?: boolean;
}

export interface HPPCompositionItemI {
  id: number;
  hpp_composition_id: number;
  hpp_category_id: number;
  hpp_category: HPPCompositionCategoryI;
  inventory_id: number;
  inventory: InventoryI;
  stock_used: number | null;
  total_price_inventory: number;
  category_name: string;
  is_deleted?: boolean;
} 

export interface HPPCompositionI {
  id: number;
  inventory_id: number;
  inventory: InventoryI;
  labor_cost: number;
  total: number;
  production_batch: number;
  hpp_items: HPPCompositionItemI[];
}

export interface HPPBatchFormI {
  requested_batch: number;
}

export interface HPPHistoryI {
  id: number;
  hpp_composition_id: number;
  total_batch: number;
  hpp_composition: HPPCompositionI;
  user_id: number;
  user: UserI;
  created_at: Date;
}