"""Seed historical orders for dashboard metrics visualization.

Creates orders with various dates spread over the last 30 days,
using existing products and users. Orders are set to CONFIRMADO.
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import random

from sqlmodel import Session, select

from app.core.database import engine
from app.db.models import User
from app.modules.pagos.model import FormaPago
from app.modules.pedidos.model import DetallePedido, HistorialEstadoPedido, Pedido
from app.modules.productos.model import Product


# Product IDs and quantities to order (random picks)
# Will be selected from available products at runtime

def run() -> None:
    with Session(engine) as session:
        # Get CONFIRMADO state id (2)
        confirmado_id = 2

        # Get all active products
        products = session.exec(
            select(Product).where(Product.deleted_at.is_(None))
        ).all()
        if not products:
            print("No products found. Run seed_catalog first.")
            return

        # Get non-admin users to assign orders
        users = session.exec(
            select(User).where(User.deleted_at.is_(None))
        ).all()
        if not users:
            print("No users found.")
            return

        # Get existing orders to avoid conflicts
        existing_ids = set(
            session.exec(select(Pedido.id)).all()
        )
        max_id = max(existing_ids) if existing_ids else 0
        next_id = max_id + 1

        # Generate orders across last 30 days
        now = datetime.now(timezone.utc)
        orders_created = 0

        # Various order scenarios with different product combos
        order_templates = [
            # (num_items, price_multiplier)
            (1, 1.0),   # Single cheap item
            (2, 0.8),   # Two items
            (3, 0.7),   # Three items  
            (1, 1.5),   # Single expensive item
            (4, 0.6),   # Many cheap items
            (2, 1.2),   # Two mid items
            (5, 0.5),   # Bulk cheap
            (1, 2.0),   # Premium single
            (3, 0.9),   # Three mid
            (2, 1.0),   # Two standard
        ]

        # Generate 1-3 orders per day for the last 30 days
        for day_offset in range(30, 0, -1):
            date = now - timedelta(days=day_offset)
            num_orders_today = random.randint(1, 3)

            for _ in range(num_orders_today):
                if next_id in existing_ids:
                    next_id += 1
                    continue

                # Pick a random user
                user = random.choice(users)

                # Pick order template
                num_items, price_mult = random.choice(order_templates)
                num_items = min(num_items, len(products))

                # Pick random products
                selected_products = random.sample(products, num_items)

                # Randomize time within the day
                hour = random.randint(8, 22)
                minute = random.randint(0, 59)
                order_date = date.replace(hour=hour, minute=minute, second=random.randint(0, 59))

                # Create the order
                total = Decimal("0.00")
                costo_envio = Decimal(str(round(random.uniform(0, 500), 2)))
                items = []

                for prod in selected_products:
                    cantidad = random.randint(1, 3)
                    
                    # Don't exceed available stock
                    if prod.stock is not None and prod.stock < cantidad:
                        if prod.stock <= 0:
                            continue
                        cantidad = prod.stock

                    precio_unitario = Decimal(str(prod.price))
                    subtotal = precio_unitario * cantidad * Decimal(str(price_mult))
                    total += subtotal

                    items.append({
                        "producto_id": prod.id,
                        "cantidad": cantidad,
                        "precio_unitario": precio_unitario,
                        "subtotal": subtotal,
                    })

                if not items:
                    continue

                # Create pedido
                pedido = Pedido(
                    id=next_id,
                    usuario_id=user.id,
                    estado_id=confirmado_id,
                    forma_pago_id=1,
                    total=total,
                    costo_envio=costo_envio,
                    direccion_calle="Av. Siempre Viva",
                    direccion_numero="123",
                    direccion_ciudad="Cordoba",
                    direccion_codigo_postal="5000",
                    created_at=order_date,
                    updated_at=order_date,
                )
                session.add(pedido)
                session.flush()

                # Create items
                for item in items:
                    detalle = DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=item["producto_id"],
                        cantidad=item["cantidad"],
                        precio_unitario=item["precio_unitario"],
                        subtotal=item["subtotal"],
                    )
                    session.add(detalle)

                    # Decrement stock
                    prod = next(p for p in products if p.id == item["producto_id"])
                    if prod.stock is not None:
                        prod.stock -= item["cantidad"]
                        session.add(prod)

                # Create historial (PENDIENTE -> CONFIRMADO)
                historial = HistorialEstadoPedido(
                    pedido_id=pedido.id,
                    estado_anterior_id=1,
                    estado_nuevo_id=2,
                    cambiado_por="SISTEMA",
                    observacion="Seed historico",
                    created_at=order_date,
                )
                session.add(historial)

                orders_created += 1
                next_id += 1

                if orders_created % 10 == 0:
                    session.flush()

        session.commit()
        print(f"Created {orders_created} historical orders across 30 days!")
        print(f"Now you should see {orders_created} data points in the dashboard graphs.")


if __name__ == "__main__":
    run()
