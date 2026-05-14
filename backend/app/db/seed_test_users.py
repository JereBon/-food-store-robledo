"""Seed test users for development / testing purposes.

Usage:
    python -m app.db.seed_test_users

Adds users with emails like nombre@test.com and password = nombre + "1234".
Skips if the user already exists.
"""
from sqlmodel import Session, select

from app.core.database import engine
from app.core.security import hash_password
from app.db.models import Role, User, UserRole


TEST_USERS = [
    {"nombre": "Admin", "apellido": "Test", "email": "admin@test.com", "password": "admin1234", "roles": ["ADMIN", "STOCK", "PEDIDOS"]},
    {"nombre": "Stock", "apellido": "Test", "email": "stock@test.com", "password": "stock1234", "roles": ["STOCK"]},
    {"nombre": "Pedidos", "apellido": "Test", "email": "pedidos@test.com", "password": "pedidos1234", "roles": ["PEDIDOS"]},
    {"nombre": "Cliente", "apellido": "Test", "email": "cliente@test.com", "password": "cliente1234", "roles": ["CLIENT"]},
    {"nombre": "Jere", "apellido": "Prueba", "email": "jere@test.com", "password": "jere1234", "roles": ["CLIENT"]},
]


def run() -> None:
    existing_emails = {
        row[0] for row in Session(engine).exec(select(User.email)).all()
    }

    for u in TEST_USERS:
        if u["email"] in existing_emails:
            print(f"  SKIP {u['email']} — already exists")
            continue

        try:
            with Session(engine) as session:
                user = User(
                    nombre=u["nombre"],
                    apellido=u["apellido"],
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                )
                session.add(user)
                session.flush()
                session.refresh(user)

                for role_code in u["roles"]:
                    role = session.exec(select(Role).where(Role.code == role_code)).first()
                    if role:
                        session.add(UserRole(user_id=user.id, role_id=role.id))

                session.commit()
                print(f"  OK   {u['email']} — password: {u['password']} — roles: {u['roles']}")
        except Exception as e:
            print(f"  FAIL {u['email']}: {e}")

    print("Done!")


if __name__ == "__main__":
    run()
