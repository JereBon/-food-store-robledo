export type RegisterPayload = {
  nombre: string
  apellido: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthResponse = {
  access_token: string
  refresh_token: string
  token_type: string
  user: {
    id: number
    email: string
    nombre: string
    apellido: string
    roles: Array<{ id: number, code: string }>
  }
}

export type RegisterResponse = AuthResponse;
