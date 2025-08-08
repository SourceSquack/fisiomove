"""
Configuración de Supabase para FisioMove Backend
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno
load_dotenv()

# Configuración de Supabase Cloud
SUPABASE_URL = os.getenv("SUPABASE_URL", "your-project-url")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY", "your-anon-key")

def get_supabase() -> Client:
    """
    Crear cliente de Supabase
    """
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Cliente global
supabase: Client = get_supabase()

def test_supabase_connection():
    """
    Probar conexión con Supabase
    """
    try:
        response = supabase.table("test_table").select("*").execute()
        print("Conexión exitosa. Respuesta:", response)
    except Exception as e:
        print("Error al conectar con Supabase:", e)

# Ejecutar prueba si se ejecuta directamente
if __name__ == "__main__":
    test_supabase_connection()
