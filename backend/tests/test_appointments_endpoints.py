from datetime import datetime, timedelta, timezone


def make_payload(start_offset_minutes=60):
    now = datetime.now(timezone.utc)
    start = now + timedelta(minutes=start_offset_minutes)
    return {
        "start_time": start.isoformat(),
        "duration_minutes": 30,
        "patient_id": "123",
        "fisio_id": None,
        "appointment_type": "consulta",
    }


def test_check_availability_missing_date(client):
    # Missing required query params (patient_id) -> 422 from FastAPI validation
    resp = client.get("/api/v1/appointments/availability")
    assert resp.status_code == 422


def test_check_availability_ok(client, monkeypatch):
    # patch service to always return True
    monkeypatch.setattr(
        "app.api.v1.endpoints.appointments.is_time_slot_available", lambda *a, **k: True
    )
    payload = {
        "start_time": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        "duration_minutes": 60,
        "patient_id": "123",
    }
    resp = client.post("/api/v1/appointments/check-availability", json=payload)
    assert resp.status_code == 200
    assert isinstance(resp.json().get("available"), bool)


def test_create_appointment_success(client, monkeypatch):
    # patch is_time_slot_available and create_appointment
    monkeypatch.setattr(
        "app.api.v1.endpoints.appointments.is_time_slot_available", lambda *a, **k: True
    )
    monkeypatch.setattr(
        "app.api.v1.endpoints.appointments.create_appointment",
        lambda db, **kw: {
            "id": 1,
            "patient_id": kw.get("patient_id"),
            "start_time": kw.get("start_time"),
            "duration_minutes": kw.get("duration_minutes"),
            "fisio_id": kw.get("fisio_id"),
            "appointment_type": "consulta",
            "status": "programada",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    payload = make_payload(120)
    resp = client.post("/api/v1/appointments/", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["patient_id"] == payload["patient_id"]


def test_list_appointments_empty(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.v1.endpoints.appointments.list_appointments", lambda db, **k: []
    )
    resp = client.get("/api/v1/appointments/")
    assert resp.status_code == 200
    assert resp.json() == []
