import psycopg
from psycopg import sql

def create_db():
    try:
        # Connect to default 'postgres' database
        conn = psycopg.connect(
            conninfo="postgresql://postgres:postgres@localhost:5432/postgres",
            autocommit=True
        )
        with conn.cursor() as cur:
            # Check if db exists
            cur.execute("SELECT 1 FROM pg_database WHERE datname = 'food_store'")
            exists = cur.fetchone()
            if not exists:
                print("Creating database 'food_store'...")
                cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier("food_store")))
                print("Database created successfully.")
            else:
                print("Database 'food_store' already exists.")
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_db()
