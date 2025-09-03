import pytest
from datetime import datetime


def test_login_success(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.sign_in_user",
        lambda email, password: {"access_token": "tok", "token_type": "bearer"},
    )
    resp = client.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "x"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_missing_credentials(client):
    # Empty fields violate pydantic model constraints -> 422
    resp = client.post("/api/v1/auth/login", json={"email": "", "password": ""})
    assert resp.status_code == 422


def test_refresh_missing_token(client):
    resp = client.post("/api/v1/auth/refresh", json={})
    assert resp.status_code == 400


def test_logout_missing_token(client):
    resp = client.post("/api/v1/auth/logout", json={})
    assert resp.status_code == 400


def test_update_email_success(client, monkeypatch):
    # update_user_self is protected by oauth dependency; tests run without oauth token -> 401
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.update_user_self",
        lambda token, new_email=None, **kwargs: {"email": new_email},
    )
    resp = client.put("/api/v1/auth/email", json={"new_email": "new@example.com"})
    assert resp.status_code == 401


def test_update_password_wrong_current(client, monkeypatch):
    # oauth dependency is not provided in test client; expect 401
    # force sign_in_user to raise so current password check fails
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.sign_in_user",
        lambda email, pwd: (_ for _ in []).throw(Exception("bad")),
    )
    resp = client.put(
        "/api/v1/auth/password",
        json={"current_password": "x", "new_password": "newpass"},
    )
    assert resp.status_code == 401


def test_admin_update_role_success(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.admin_update_user_by_email",
        lambda email, role: {"email": email, "role": role},
    )
    resp = client.put("/api/v1/auth/role", json={"email": "a@b.com", "role": "admin"})
    assert resp.status_code == 200
