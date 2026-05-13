import type { ICategoryReadShort } from './category'
import type { IIngredientReadShort } from './ingredient'

export interface IProduct {
  id: number
  name: string
  description?: string | null
  price: number
  stock: number
  disponible: boolean
  imagen_url?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  categories: ICategoryReadShort[]
  ingredients: IIngredientReadShort[]
}

export interface IProductCreate {
  name: string
  description?: string | null
  price: number
  stock: number
  disponible?: boolean
  imagen_url?: string | null
  category_ids: number[]
}

export interface IProductUpdate {
  name?: string | null
  description?: string | null
  price?: number | null
  stock?: number | null
  disponible?: boolean | null
  imagen_url?: string | null
  category_ids?: number[] | null
}

export interface IProductListResponse {
  items: IProduct[]
  total: number
  skip: number
  limit: number
}
