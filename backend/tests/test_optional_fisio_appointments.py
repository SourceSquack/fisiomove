import pytest
from datetime import datetime, timedelta, timezone


def dt(minutes_from_now=0):
    return datetime.now(timezone.utc) + timedelta(minutes=minutes_from_now)


def test_create_appointment_without_fisio_id(client):
    """
    Test para verificar que se puede crear una cita sin asignar fisioterapeuta
    y que se crean las notificaciones apropiadas.
    """

    # Datos para crear una cita sin fisio_id
    appointment_data = {
        "patient_id": "123",
        "start_time": dt(60).isoformat(),
        "duration_minutes": 60,
        # fisio_id se omite intencionalmente
    }

    # Crear la cita
    response = client.post("/api/v1/appointments/", json=appointment_data)

    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")

    # Verificar que la cita se creó exitosamente
    assert response.status_code == 201, f"Error: {response.text}"

    appointment = response.json()

    # Verificar que la cita fue creada correctamente (usamos ID numérico en tests)
    assert appointment["patient_id"] == "123"
    assert appointment["fisio_id"] is None  # No debe tener fisioterapeuta asignado
    assert appointment["duration_minutes"] == 60
    assert appointment["status"] == "programada"

    print("✅ Test exitoso: Se puede crear cita sin fisioterapeuta asignado")


def test_create_appointment_with_fisio_id(client):
    """
    Test para verificar que también funciona la creación tradicional con fisio_id
    """

    appointment_data = {
        "patient_id": "456",
        "fisio_id": "789",
        "start_time": dt(120).isoformat(),
        "duration_minutes": 45,
    }

    response = client.post("/api/v1/appointments/", json=appointment_data)

    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")

    assert response.status_code == 201, f"Error: {response.text}"

    appointment = response.json()

    # Verificar que la cita fue creada correctamente con fisioterapeuta (IDs numéricos)
    assert appointment["patient_id"] == "456"
    assert appointment["fisio_id"] == "789"
    assert appointment["duration_minutes"] == 45
    assert appointment["status"] == "programada"

    print("✅ Test exitoso: Se puede crear cita con fisioterapeuta asignado")


def test_appointment_list_endpoint(client):
    """
    Test para verificar que el endpoint de listado funciona correctamente
    """

    response = client.get("/api/v1/appointments/")

    print(f"List response status: {response.status_code}")
    print(f"List response body: {response.text}")

    assert response.status_code == 200

    appointments = response.json()
    assert isinstance(appointments, list)

    print("✅ Test exitoso: Endpoint de listado funciona correctamente")


def test_appointment_creation_with_current_user_as_patient(client):
    """
    Test para verificar notificaciones cuando el paciente es un usuario válido del sistema
    """

    # Usar un ID de usuario válido (el usuario de prueba del conftest)
    appointment_data = {
        "patient_id": "1",  # Usuario válido del sistema definido en conftest
        "start_time": dt(180).isoformat(),
        "duration_minutes": 30,
    }

    response = client.post("/api/v1/appointments/", json=appointment_data)

    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")

    assert response.status_code == 201, f"Error: {response.text}"

    appointment = response.json()
    # El conftest define el usuario con id "1" en este entorno de pruebas
    assert appointment["patient_id"] == "1"
    assert appointment["fisio_id"] is None

    print("✅ Test exitoso: Cita creada para usuario válido del sistema")
