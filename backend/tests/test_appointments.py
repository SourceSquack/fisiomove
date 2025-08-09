from datetime import datetime, timedelta, timezone
import logging


def dt(minutes_from_now=0):
    return datetime.now(timezone.utc) + timedelta(minutes=minutes_from_now)


def test_appointments_crud_and_conflict(client):
    logging.info("[Citas] Programar una cita base (fisio-1)")
    base = dt(60)

    a1 = {
        "start_time": base.isoformat(),
        "duration_minutes": 60,
        "patient_id": "patient-1",
        "fisio_id": "fisio-1",
    }
    r = client.post("/api/v1/citas", json=a1)
    assert r.status_code == 201, r.text
    ap1 = r.json()

    logging.info(
        "[Citas] Intentar crear otra cita solapada para el mismo fisio -> debe fallar 400"
    )
    a2 = {
        "start_time": (base + timedelta(minutes=30)).isoformat(),
        "duration_minutes": 30,
        "patient_id": "patient-2",
        "fisio_id": "fisio-1",
    }
    r = client.post("/api/v1/citas", json=a2)
    assert r.status_code == 400

    logging.info("[Citas] Crear cita no solapada para el mismo fisio -> OK")
    a3 = {
        "start_time": (base + timedelta(minutes=60)).isoformat(),
        "duration_minutes": 30,
        "patient_id": "patient-2",
        "fisio_id": "fisio-1",
    }
    r = client.post("/api/v1/citas", json=a3)
    assert r.status_code == 201
    ap3 = r.json()

    logging.info("[Citas] Listar por día y comprobar que aparecen las citas creadas")
    r = client.get(f"/api/v1/citas", params={"date": base.isoformat()})
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 2

    logging.info("[Citas] Intentar actualizar cita a horario solapado -> 400")
    upd = {"start_time": (base + timedelta(minutes=30)).isoformat()}
    r = client.put(f"/api/v1/citas/{ap3['id']}", json=upd)
    assert r.status_code == 400

    logging.info("[Citas] Cancelar la primera cita -> status cancelada")
    r = client.delete(f"/api/v1/citas/{ap1['id']}")
    assert r.status_code == 200
    assert r.json()["status"] == "cancelada"


from datetime import datetime, timedelta, timezone


def dt(minutes_from_now=0):
    # Ensure timezone-aware (UTC) to match model expecting tz
    return datetime.now(timezone.utc) + timedelta(minutes=minutes_from_now)


def test_appointments_crud_and_conflict(client):
    base = dt(60)  # start one hour from now

    # Create first appointment
    a1 = {
        "start_time": base.isoformat(),
        "duration_minutes": 60,
        "patient_id": "patient-1",
        "fisio_id": "fisio-1",
    }
    r = client.post("/api/v1/citas", json=a1)
    assert r.status_code == 201, r.text
    ap1 = r.json()

    # Create overlapping appointment for same fisio -> should 400
    a2 = {
        "start_time": (base + timedelta(minutes=30)).isoformat(),
        "duration_minutes": 30,
        "patient_id": "patient-2",
        "fisio_id": "fisio-1",
    }
    r = client.post("/api/v1/citas", json=a2)
    assert r.status_code == 400

    # Create non-overlapping for same fisio -> ok
    a3 = {
        "start_time": (base + timedelta(minutes=60)).isoformat(),
        "duration_minutes": 30,
        "patient_id": "patient-2",
        "fisio_id": "fisio-1",
    }
    r = client.post("/api/v1/citas", json=a3)
    assert r.status_code == 201
    ap3 = r.json()

    # List by day
    r = client.get(f"/api/v1/citas", params={"date": base.isoformat()})
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 2

    # Update appointment to overlap -> 400
    upd = {"start_time": (base + timedelta(minutes=30)).isoformat()}
    r = client.put(f"/api/v1/citas/{ap3['id']}", json=upd)
    assert r.status_code == 400

    # Cancel first appointment
    r = client.delete(f"/api/v1/citas/{ap1['id']}")
    assert r.status_code == 200
    assert r.json()["status"] == "cancelada"
