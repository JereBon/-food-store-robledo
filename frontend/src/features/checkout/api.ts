import { http } from '@/shared/api/http'

export type DireccionEntrega = {
  id: number
  usuario_id: number
  calle: string
  numero: string | null
  piso: string | null
  ciudad: string
  codigo_postal: string | null
  es_predeterminada: boolean
  created_at: string
  deleted_at: string | null
}

export type DireccionCreate = {
  calle: string
  numero?: string
  piso?: string
  ciudad: string
  codigo_postal?: string
}

export type DireccionUpdate = {
  calle?: string
  numero?: string
  piso?: string
  ciudad?: string
  codigo_postal?: string
}

export const fetchDirecciones = () =>
  http.get<DireccionEntrega[]>('/direcciones').then((r) => r.data)

export const createDireccion = (data: DireccionCreate) =>
  http.post<DireccionEntrega>('/direcciones', data).then((r) => r.data)

export const updateDireccion = (id: number, data: DireccionUpdate) =>
  http.patch<DireccionEntrega>(`/direcciones/${id}`, data).then((r) => r.data)

export const deleteDireccion = (id: number) =>
  http.delete(`/direcciones/${id}`).then(() => {})

export const setDireccionPredeterminada = (id: number) =>
  http.patch<DireccionEntrega>(`/direcciones/${id}/predeterminada`).then((r) => r.data)

export const fetchDireccionesEliminadas = () =>
  http.get<DireccionEntrega[]>('/direcciones/eliminadas').then((r) => r.data)

export const restoreDireccion = (id: number) =>
  http.patch<DireccionEntrega>(`/direcciones/${id}/reactivar`).then((r) => r.data)
