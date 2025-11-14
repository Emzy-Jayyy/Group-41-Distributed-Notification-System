# app/database.py
from sqlalchemy import create_engine
from sqlmodel import SQLModel
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from .sec import settings
import redis

# 1. PostgreSQL (Sync) Setup
# We pass the 'sslmode': 'require' in connect_args.
# This is the correct way for psycopg2 (the sync driver).
engine = create_engine(
    str(settings.DATABASE_URL),
    echo=False,
    pool_pre_ping=True
)

#sync session maker
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


# Sync session dependency
def get_db():
    """
    Synchronous database session dependency for FastAPI.
    """
    session = SessionLocal()
    try:
        yield session
    except IntegrityError:
        session.rollback()
        raise
    except SQLAlchemyError:
        session.rollback()
        raise
    except Exception:
        session.rollback()
        raise
    finally:
        # This is crucial in a sync 'yield' dependency
        session.close()

# Initialize and create db and tables
def init_db() -> None:
    """
    Synchronously creates all tables in the database
    that are defined by SQLModel.
    """
    print("Initializing database...")
    SQLModel.metadata.create_all(engine)
    print("Database tables created (if not exist).")


# --- 2. Redis (Sync) Setup ---

try:
    # This uses the sync 'redis-py' library
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        db=0,
        decode_responses=True 
    )
    redis_client.ping()
    print("Connected to Redis successfully!")
except redis.exceptions.ConnectionError as e:
    print(f"CRITICAL: Could not connect to Redis: {e}")
    redis_client = None
except Exception as e:
    print(f"An unexpected error occurred with Redis: {e}")
    redis_client = None