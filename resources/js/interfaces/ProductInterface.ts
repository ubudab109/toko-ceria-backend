import { CategoryI } from "./CategoryInterface";

export interface ProductImageI {
  id?: number;
  product_id: number;
  image_url: string | File;
  is_thumbnail: boolean;
  is_deleted?: boolean;
}

export interface ProductImageInputI {
  image_url: File;
}

export interface ProductI {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  limited_stock: boolean;
  category: CategoryI;
  stock?: number;
  origin?: string;
  abv?: string;
  volume?: number;
  measurement?: string;
  productImages?: ProductImageI[];
  product_images?: ProductImageI[];
  is_public?: boolean;
}

export interface ProductRequestI {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  limited_stock: boolean;
  category: CategoryI;
  origin?: string;
  abv?: string;
  volume?: number;
  measurement?: string;
  productImages?: ProductImageI[];
  productImageInputs?: ProductImageInputI[]
}