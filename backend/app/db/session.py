from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

_db_url = str(settings.DATABASE_URL)

if _db_url.startswith("sqlite"):
    engine = create_engine(_db_url, connect_args={"check_same_thread": False})
else:
    if _db_url.startswith("postgresql") and "sslmode=" not in _db_url:
        sep = "&" if "?" in _db_url else "?"
        _db_url = f"{_db_url}{sep}sslmode=require"
    engine = create_engine(_db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
