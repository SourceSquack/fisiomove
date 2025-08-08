"""
Módulo para autenticación con Supabase
"""
from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

def get_auth_client() -> Client:
    """
    Crear cliente de autenticación de Supabase
    """
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Cliente global para autenticación
auth_client: Client = get_auth_client()
