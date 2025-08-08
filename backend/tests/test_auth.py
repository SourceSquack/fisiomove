from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from app.main import app
from app.db.base import Base
from app.db.session import get_db

DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}) if DATABASE_URL.startswith("sqlite") else create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def setup_module(module):
    Base.metadata.create_all(bind=engine)

def teardown_module(module):
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_register_and_login():
    payload = {"email": "user@example.com", "password": "Password123", "full_name": "User Test"}
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 201, r.text

    r = client.post("/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]

    r = client.get("/api/v1/protected/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200

    r = client.get("/api/v1/protected/admin-only", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code in (401, 403)
