/**
 * Category entity types
 */

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  deleted_at?: string | null; // ISO 8601 datetime
}

export interface ICategoryCreate {
  name: string;
  description?: string | null;
}

export interface ICategoryUpdate {
  name?: string | null;
  description?: string | null;
}

export interface ICategoryReadShort {
  id: number;
  name: string;
  slug: string;
}
