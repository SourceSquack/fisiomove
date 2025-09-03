import logging


def test_patients_crud_flow(client):
    logging.info("[Patients] Create a patient with basic data")
    payload = {
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "123456789",
        "dni": "1234567890",
        "height_cm": 180,
        "weight_kg": 80.5,
        "blood_type": "O+",
    }
    r = client.post("/api/v1/patients", json=payload)
    assert r.status_code == 201, r.text
    created = r.json()
    pid = created["id"]

    logging.info("[Patients] Retrieve the created patient by ID and validate fields")
    r = client.get(f"/api/v1/patients/{pid}")
    assert r.status_code == 200
    assert r.json()["full_name"] == "John Doe"

    logging.info("[Patients] List patients and verify the created one appears")
    r = client.get("/api/v1/patients")
    assert r.status_code == 200
    assert any(p["id"] == pid for p in r.json())

    logging.info("[Patients] Update the patient's name and phone")
    upd = {"full_name": "John X. Doe", "phone": "987654321"}
    r = client.put(f"/api/v1/patients/{pid}", json=upd)
    assert r.status_code == 200
    assert r.json()["full_name"] == "John X. Doe"

    logging.info("[Patients] Delete the patient and verify 404 when retrieving")
    r = client.delete(f"/api/v1/patients/{pid}")
    assert r.status_code == 204

    r = client.get(f"/api/v1/patients/{pid}")
    assert r.status_code == 404
