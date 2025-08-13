import os
import sys
from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root on sys.path so `app` package resolves when running from repo root
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.services.auth import get_current_user


# Use a local SQLite DB for tests
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args=(
        {"check_same_thread": False} if TEST_DATABASE_URL.startswith("sqlite") else {}
    ),
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


CURRENT_TEST_USER = {
    "id": "test-user-1",
    "email": "tester@example.com",
    "user_metadata": {
        "first_name": "Test",
        "last_name": "User",
        "full_name": "Test User",
        "role": "admin",
    },
}


def fake_get_current_user():
    # Allows role swap by modifying CURRENT_TEST_USER in tests, if needed
    return CURRENT_TEST_USER


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = fake_get_current_user
    with TestClient(app) as c:
        yield c
