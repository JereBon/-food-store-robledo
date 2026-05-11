## 1. Backend - Modelo y persistencia

- [x] 1.1 Definir/validar modelos SQLModel para User y RefreshToken (campos, relaciones, soft delete)
- [x] 1.2 Agregar/ajustar repositorios para usuarios y refresh tokens siguiendo BaseRepository
- [x] 1.3 Incluir migraciones Alembic correspondientes

## 2. Backend - Servicios y casos de uso

- [x] 2.1 Implementar servicio de registro con validaciones (email único, contraseña >= 8, rol CLIENT)
- [x] 2.2 Implementar hashing con Passlib bcrypt (cost >= 10)
- [x] 2.3 Implementar emisión de tokens access/refresh y persistencia de refresh token
- [x] 2.4 Definir errores RFC 7807 para email duplicado y contraseña inválida

## 3. Backend - Router y dependencias

- [x] 3.1 Crear endpoint POST /api/v1/auth/register con DTOs de request/response
- [x] 3.2 Integrar UnitOfWork para transacciones del registro
- [x] 3.3 Asegurar respuesta incluye access token (30 min) y refresh token (7 días)

## 4. Frontend - Feature de registro

- [x] 4.1 Crear UI de registro en pages/features (formulario email/password)
- [x] 4.2 Integrar TanStack Query mutation para registro
- [x] 4.3 Persistir tokens en authStore (Zustand) y manejar errores de email duplicado

## 5. Validaciones y documentación

- [x] 5.1 Validar reglas RN-AU01/RN-AU07/RN-AU08 en el flujo de registro
- [x] 5.2 Verificar cumplimiento de specs y ajustar docs si es necesario
