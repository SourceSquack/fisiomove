"""Configuración de Supabase para FisioMove Backend

Notas de seguridad (inline):
- Evitar inicializar clientes globales con secrets al importar el módulo en entornos donde
    no se desea exponer credenciales. Preferir función que reciba las credenciales o un
    factory que sea llamada desde el punto de entrada de la aplicación.
- Nunca commitear valores reales de SUPABASE_KEY en el repo. Use variables de entorno
    y/o un secrets manager en producción.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno solo si existen archivos .env locales (no fatal)
load_dotenv()

# Configuración de Supabase Cloud — deben venir desde variables de entorno en tiempo de ejecución
# TODO: en producción, recuperar estas claves desde un secreto gestionado (Vault, KeyVault, etc.)
SUPABASE_URL = os.getenv("SUPABASE_URL", "your-project-url")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY", "your-anon-key")


def get_supabase(url: str | None = None, key: str | None = None) -> Client:
    """Crear cliente de Supabase.

    Recomendación de seguridad:
    - Evitar inicializar un cliente global en el momento de importar el módulo.
    - En vez de usar el cliente global, llame a esta función desde el arranque y pase
        las credenciales tomadas de un secret manager o variables de entorno seguras.
    """
    _url = url or SUPABASE_URL
    _key = key or SUPABASE_KEY
    return create_client(_url, _key)


# Cliente global (uso rápido para desarrollo). En production evite usar este singleton.
supabase: Client = get_supabase()


def test_supabase_connection():
    """Probar conexión con Supabase (solo para desarrollo).

    Nota: esta función realiza una llamada simple. No loguee secretos ni respuestas
    que contengan información sensible en entornos de producción.
    """
    try:
        response = supabase.table("test_table").select("*").execute()
        print("Conexión exitosa. Respuesta:", response)
    except Exception as e:
        print("Error al conectar con Supabase:", e)


# Ejecutar prueba si se ejecuta directamente (manual). No ejecutar en CI/Prod automáticamente.
if __name__ == "__main__":
    test_supabase_connection()
