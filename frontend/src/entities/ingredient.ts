export interface IIngredient {
  id: number
  nombre: string
  es_alergeno: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface IIngredientCreate {
  nombre: string
  es_alergeno?: boolean
}

export interface IIngredientUpdate {
  nombre?: string | null
  es_alergeno?: boolean | null
}

export interface IIngredientReadShort {
  id: number
  nombre: string
  es_alergeno: boolean
  es_removible: boolean
}
