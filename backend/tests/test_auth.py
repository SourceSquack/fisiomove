import logging
import pytest


def test_auth_me_returns_user(client):
    logging.info("[Auth] Consultar /auth/me con usuario simulado")
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 200
    body = r.json()
    assert set(
        ["id", "email", "first_name", "last_name", "full_name", "role"]
    ).issubset(body.keys())


@pytest.fixture()
def set_role_admin(monkeypatch):
    from app.services import auth as auth_service

    def fake_admin_user():
        return {
            "id": "admin-1",
            "email": "admin@example.com",
            "user_metadata": {
                "first_name": "Admin",
                "last_name": "User",
                "full_name": "Admin User",
                "role": "admin",
            },
        }

    monkeypatch.setattr(auth_service, "get_current_user", lambda: fake_admin_user())


@pytest.fixture()
def set_role_fisio(monkeypatch):
    from app.services import auth as auth_service

    def fake_fisio_user():
        return {
            "id": "fisio-1",
            "email": "fisio@example.com",
            "user_metadata": {"full_name": "Fisio", "role": "fisioterapeuta"},
        }

    monkeypatch.setattr(auth_service, "get_current_user", lambda: fake_fisio_user())


@pytest.fixture()
def set_role_paciente(monkeypatch):
    from app.services import auth as auth_service

    def fake_paciente_user():
        return {
            "id": "patient-1",
            "email": "patient@example.com",
            "user_metadata": {"full_name": "Paciente", "role": "paciente"},
        }

    monkeypatch.setattr(auth_service, "get_current_user", lambda: fake_paciente_user())


@pytest.mark.xfail(reason="Autorización por roles aún no implementada en endpoints")
def test_roles_paciente_no_puede_crear_cita(client, set_role_paciente):
    logging.info("[Roles] Un paciente no debería poder crear citas (espera 403)")
    payload = {
        "start_time": "2025-01-01T10:00:00Z",
        "duration_minutes": 30,
        "patient_id": "patient-1",
        "fisio_id": "fisio-1",
    }
    r = client.post("/api/v1/citas", json=payload)
    assert r.status_code == 403


@pytest.mark.xfail(reason="Autorización por roles aún no implementada en endpoints")
def test_roles_fisio_puede_crear_cita(client, set_role_fisio):
    logging.info("[Roles] Un fisio debería poder crear citas (espera 201)")
    payload = {
        "start_time": "2025-01-01T11:00:00Z",
        "duration_minutes": 30,
        "patient_id": "patient-2",
        "fisio_id": "fisio-1",
    }
    r = client.post("/api/v1/citas", json=payload)
    assert r.status_code == 201


@pytest.mark.xfail(reason="Autorización por roles aún no implementada en endpoints")
def test_roles_paciente_no_puede_crear_paciente(client, set_role_paciente):
    logging.info(
        "[Roles] Un paciente no debería poder crear registros de paciente (espera 403)"
    )
    payload = {"full_name": "John Doe"}
    r = client.post("/api/v1/pacientes", json=payload)
    assert r.status_code == 403
