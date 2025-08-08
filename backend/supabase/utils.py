"""
Módulo para utilidades generales relacionadas con Supabase
"""
def test_supabase_connection(client):
    """
    Probar conexión con Supabase
    """
    try:
        response = client.table("test_table").select("*").execute()
        print("Conexión exitosa. Respuesta:", response)
    except Exception as e:
        print("Error al conectar con Supabase:", e)
