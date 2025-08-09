import logging


def test_patients_crud_flow(client):
    logging.info("[Pacientes] Crear un paciente con datos básicos")
    # Create
    payload = {
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "123456789",
        "height_cm": 180,
        "weight_kg": 80.5,
        "blood_type": "O+",
    }
    r = client.post("/api/v1/pacientes", json=payload)
    assert r.status_code == 201, r.text
    created = r.json()
    pid = created["id"]

    logging.info("[Pacientes] Obtener el paciente creado por ID y validar campos")
    # Get
    r = client.get(f"/api/v1/pacientes/{pid}")
    assert r.status_code == 200
    assert r.json()["full_name"] == "John Doe"

    logging.info("[Pacientes] Listar pacientes y verificar que el creado aparece")
    # List
    r = client.get("/api/v1/pacientes")
    assert r.status_code == 200
    assert any(p["id"] == pid for p in r.json())

    logging.info("[Pacientes] Actualizar nombre y teléfono del paciente")
    # Update
    upd = {"full_name": "John X. Doe", "phone": "987654321"}
    r = client.put(f"/api/v1/pacientes/{pid}", json=upd)
    assert r.status_code == 200
    assert r.json()["full_name"] == "John X. Doe"

    logging.info("[Pacientes] Eliminar el paciente y comprobar 404 al consultarlo")
    # Delete
    r = client.delete(f"/api/v1/pacientes/{pid}")
    assert r.status_code == 204

    # Get after delete
    r = client.get(f"/api/v1/pacientes/{pid}")
    assert r.status_code == 404
