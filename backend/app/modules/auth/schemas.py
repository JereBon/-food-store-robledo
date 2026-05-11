from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=80)
    apellido: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8)
    telefono: str | None = Field(default=None, max_length=30)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
