export type RegisterPayload = {
  nombre: string
  apellido: string
  email: string
  password: string
}

export type RegisterResponse = {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}
