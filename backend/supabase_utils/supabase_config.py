"""
Configuración de Supabase para FisioMove Backend
"""
from supabase import create_client
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_API_KEY)
