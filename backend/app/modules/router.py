from fastapi import APIRouter

from app.modules.admin.router import router as admin_router
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.ingredientes.router import router as ingredientes_router
from app.modules.health.router import router as health_router
from app.modules.direcciones.router import router as direcciones_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.pagos.router import router as pagos_router


api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(admin_router, tags=["admin"])
api_router.include_router(categorias_router, tags=["categories"])
api_router.include_router(productos_router, tags=["products"])
api_router.include_router(ingredientes_router, tags=["ingredients"])
api_router.include_router(direcciones_router, tags=["direcciones"])
api_router.include_router(pedidos_router, tags=["pedidos"])
api_router.include_router(pagos_router, tags=["pagos"])
