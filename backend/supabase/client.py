"""
Módulo para configuración del cliente principal de Supabase
"""
from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

def get_supabase_client() -> Client:
    """
    Crear cliente principal de Supabase
    """
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Cliente global
supabase_client: Client = get_supabase_client()
