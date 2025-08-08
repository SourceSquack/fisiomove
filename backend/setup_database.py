"""
Script para configurar la base de datos en Supabase
"""
from supabase.client import supabase_client as supabase

def setup_database():
    """
    Crear tablas y datos iniciales en Supabase
    """
    try:
        # Ejemplo: Crear una tabla
        response = supabase.table("users").create({
            "id": "uuid",
            "email": "text",
            "password": "text"
        }).execute()
        print("Tabla creada exitosamente:", response)
    except Exception as e:
        print("Error al configurar la base de datos:", e)

if __name__ == "__main__":
    setup_database()