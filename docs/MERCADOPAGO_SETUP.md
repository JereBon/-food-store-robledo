# Configuración de MercadoPago

## Credenciales

1. Entrá a [mercadopago.com.ar/developers/panel](https://www.mercadopago.com.ar/developers/panel)
2. Seleccioná tu aplicación → **Credenciales de prueba**
3. Copiá el **Access Token** y la **Public Key**
4. Pegálos en `backend/.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
```

---

## Ngrok (para webhooks reales)

MercadoPago necesita una URL pública para enviarte los webhooks y para las `back_urls` de redirección post-pago. En desarrollo local usás ngrok para exponer el backend.

### Instalación y autenticación

```bash
# Crear cuenta en https://dashboard.ngrok.com/signup
ngrok config add-authtoken TU_TOKEN
```

### Uso

Con el backend corriendo en el puerto 8000, abrí una terminal aparte:

```bash
ngrok http 8000
```

Ngrok te da una URL pública tipo:
```
Forwarding: https://abc123.ngrok-free.dev -> http://localhost:8000
```

Copiá esa URL y pegála en `backend/.env`:

```env
BACKEND_URL=https://abc123.ngrok-free.dev
FRONTEND_URL=http://localhost:5173
```

> **Importante**: la URL de ngrok cambia cada vez que lo reiniciás (en el plan gratuito). Tenés que actualizar `BACKEND_URL` en el `.env` cada vez.

---

## Arrancar el backend con el .env cargado

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --env-file .env
```

El flag `--env-file .env` es obligatorio — sin él las variables de entorno no se cargan y el pago se simula localmente.

---

## Flujo de pago

```
Usuario confirma pedido
    → POST /pedidos (estado: PENDIENTE)
    → POST /pagos/crear-preferencia → MP API → devuelve init_point
    → Frontend redirige a la URL de MP
    → Usuario paga en MP
    → MP redirige a https://ngrok.../pago/exito
    → Backend redirige a http://localhost:5173/pago/exito
    → MP envía webhook a https://ngrok.../api/v1/pagos/webhook
    → Backend: pedido pasa a CONFIRMADO + descuenta stock
```

---

## Modo simulado (sin ngrok)

Si `BACKEND_URL` contiene `localhost`, el pago se simula automáticamente sin llamar a MP. Útil para desarrollo cuando no necesitás probar el flujo de pago completo.

```env
BACKEND_URL=http://localhost:8000   # simula el pago
```

---

## Tarjetas de prueba

| Resultado | Número | Vencimiento | CVV | Nombre titular |
|-----------|--------|-------------|-----|----------------|
| Aprobado  | `4509 9535 6623 3704` | cualquiera futura | `123` | `APRO` |
| Rechazado | `4509 9535 6623 3704` | cualquiera futura | `123` | `OTHE` |
