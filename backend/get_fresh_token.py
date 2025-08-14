import requests
import json

# Base URL del API
BASE_URL = "http://localhost:8000/api/v1"

# Usuarios disponibles
USERS = {
    "admin": {"email": "admin@fisiomove.com", "password": "Admin123"},
    "fisio": {"email": "fisio@fisiomove.com", "password": "Fisio123"},
}


def get_token(user_type="admin"):
    """Obtiene un token de acceso para el usuario especificado"""

    if user_type not in USERS:
        print(f"Usuario '{user_type}' no válido. Opciones: {list(USERS.keys())}")
        return None

    login_data = USERS[user_type]

    try:
        print(f"Obteniendo token para: {login_data['email']}")
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)

        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print(f"✅ Token obtenido exitosamente")
            print(f"Token: {access_token}")

            # Guardar en archivo
            with open(f"token_{user_type}.txt", "w") as f:
                f.write(access_token)
            print(f"Token guardado en: token_{user_type}.txt")

            return access_token

        else:
            print(f"❌ Error al obtener token: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None


def test_appointment_detail(token, appointment_id=3):
    """Prueba el endpoint de detalle de cita"""

    headers = {"Authorization": f"Bearer {token}"}

    try:
        print(f"\n🔍 Probando GET /appointments/{appointment_id}")
        response = requests.get(
            f"{BASE_URL}/appointments/{appointment_id}", headers=headers
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            print("✅ Endpoint funcionando correctamente")
            data = response.json()
            print("📋 Datos de la cita:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Respuesta: {response.text}")

    except Exception as e:
        print(f"❌ Error: {e}")


def test_appointments_list(token):
    """Prueba el endpoint de lista de citas"""

    headers = {"Authorization": f"Bearer {token}"}

    try:
        print(f"\n📋 Probando GET /appointments")
        response = requests.get(f"{BASE_URL}/appointments", headers=headers)

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            print("✅ Lista de citas obtenida")
            data = response.json()
            print(f"Número de citas: {len(data)}")
            for i, cita in enumerate(data[:3]):  # Mostrar solo las primeras 3
                print(
                    f"  {i+1}. ID: {cita.get('id')}, Paciente: {cita.get('patient_id')}, Tipo: {cita.get('appointment_type')}"
                )
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Respuesta: {response.text}")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    print("🚀 Iniciando tests del API de FisioMove")
    print("=" * 50)

    # Obtener token para admin
    token = get_token("admin")

    if token:
        # Probar endpoints
        test_appointments_list(token)
        test_appointment_detail(token, 3)

        print("\n" + "=" * 50)
        print("✅ Tests completados")
    else:
        print("❌ No se pudo obtener token. Verifica que el servidor esté corriendo.")
