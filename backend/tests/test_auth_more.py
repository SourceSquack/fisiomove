import pytest


def test_register_dev_bypass_existing_user(client, monkeypatch):
    # Simulate DEV bypass: existing user found -> confirmed
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.settings.DEV_BYPASS_EMAIL_CONFIRM",
        True,
        raising=False,
    )
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.settings.SUPABASE_SERVICE_ROLE_KEY",
        "sk_test",
        raising=False,
    )

    # admin_get_user_by_email returns an existing user dict
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.admin_get_user_by_email",
        lambda email: {"id": "u1", "email": email},
    )
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.admin_confirm_user_by_email",
        lambda email: True,
    )

    payload = {"email": "x@ex.com", "password": "password123", "role": "paciente"}
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    assert "message" in resp.json() or "user" in resp.json()


def test_register_regular_calls_signup(client, monkeypatch):
    # Ensure bypass disabled
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.settings.DEV_BYPASS_EMAIL_CONFIRM",
        False,
        raising=False,
    )

    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.sign_up_user",
        lambda email, password, **kwargs: {"id": "new", "email": email},
    )
    payload = {"email": "r@ex.com", "password": "password123", "role": "paciente"}
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201
    assert resp.json().get("id") == "new"


def test_login_bypass_email_not_confirmed(client, monkeypatch):
    email = "bypass@ex.com"
    # cause sign_in_user to raise ValueError with specific detail
    def raise_not_confirmed(e, p):
        raise ValueError({"detail": {"error_code": "email_not_confirmed"}})

    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.sign_in_user",
        raise_not_confirmed,
    )

    # enable dev bypass and list the email
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.settings.DEV_BYPASS_EMAIL_CONFIRM",
        True,
        raising=False,
    )
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.settings.DEV_BYPASS_EMAILS",
        email,
        raising=False,
    )

    # admin_confirm_user_by_email and sign_in_user (after confirm) should be called
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.admin_confirm_user_by_email",
        lambda em: True,
    )
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.sign_in_user",
        lambda em, pw: {"access_token": "tk", "token_type": "bearer"},
    )

    resp = client.post("/api/v1/auth/login", json={"email": email, "password": "p"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_refresh_and_logout_success(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.refresh_session",
        lambda token: {"access_token": "new", "refresh_token": token},
    )
    r = client.post("/api/v1/auth/refresh", json={"refresh_token": "r1"})
    assert r.status_code == 200
    assert r.json().get("access_token") == "new"

    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.logout",
        lambda token: True,
    )
    l = client.post("/api/v1/auth/logout", json={"access_token": "a1"})
    assert l.status_code == 200
    assert l.json().get("ok") is True


def test_update_email_and_password_success(client, monkeypatch):
    # Provide reusable oauth dependency and ensure update_user_self works
    # FastAPI dependencies must be overridden via app.dependency_overrides
    from app.main import app as _app
    from app.api.v1.endpoints import auth as auth_mod
    _app.dependency_overrides[auth_mod.reuseable_oauth] = lambda: "tok"
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.update_user_self",
        lambda token, **kwargs: {"email": kwargs.get("new_email") or "u@e"},
    )
    # update email
    resp = client.put("/api/v1/auth/email", json={"new_email": "n@e.com"})
    assert resp.status_code == 200
    assert resp.json()["user"]["email"] == "n@e.com"

    # For password update we need sign_in_user to succeed for current password check
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.sign_in_user",
        lambda email, pwd: {"access_token": "ok"},
    )
    resp2 = client.put(
        "/api/v1/auth/password",
        json={"current_password": "pwdpwd", "new_password": "newlongpwd"},
    )
    assert resp2.status_code == 200


def test_admin_update_role_failure(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.v1.endpoints.auth.admin_update_user_by_email",
        lambda email, role: None,
    )
    r = client.put("/api/v1/auth/role", json={"email": "a@b.com", "role": "admin"})
    assert r.status_code == 400
