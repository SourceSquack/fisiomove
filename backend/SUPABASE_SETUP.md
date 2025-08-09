# 🚀 Configuración de Supabase para FisioMove

## ✅ Estado Actual

- ✅ Supabase CLI instalado (v2.33.9)
- ✅ Proyecto inicializado
- ✅ Archivos de configuración creados
- ✅ Dependencias agregadas a requirements.txt

## 🔧 Pasos para completar la configuración:

### 1. Crear cuenta en Supabase (GRATIS)

1. Ve a [supabase.com](https://supabase.com/)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### 2. Obtener las credenciales

1. En tu dashboard de Supabase, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - `Project URL`
   - `anon/public key`

### 3. Configurar las variables de entorno

Edita el archivo `.env` y reemplaza:

```bash
SUPABASE_URL=your-project-url          # ← Pegar tu Project URL
SUPABASE_ANON_KEY=your-anon-key        # ← Pegar tu anon key
```

### 4. Instalar dependencias

```bash
# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Instalar supabase-py
pip install supabase==2.9.1
```

### 5. Configurar la base de datos

```bash
# Ejecutar el script de setup
python setup_database.py
```

## 🎯 Alternativas de Deployment Gratuitas:

### Opción 1: Supabase Cloud (RECOMENDADO)

- ✅ 500MB gratis
- ✅ Dashboard web
- ✅ APIs automáticas
- ✅ Autenticación incluida

### Opción 2: Railway

- ✅ $5 USD mensuales gratis
- ✅ PostgreSQL hasta 1GB

### Opción 3: Render

- ✅ 1GB PostgreSQL gratis
- ✅ 90 días de retención

## 🔄 Comandos útiles

```bash
# Iniciar Supabase local (requiere Docker)
supabase start

# Ver estado del proyecto
supabase status

# Generar tipos TypeScript
supabase gen types typescript --local

# Reset de la base de datos local
supabase db reset

# Deploy de migraciones
supabase db push
```

## 📝 Próximos pasos:

1. Completar configuración de Supabase Cloud
2. Crear las tablas iniciales
3. Integrar con tu API FastAPI
4. Configurar autenticación
5. Deploy del backend

## Citas (Appointments)

Se agregó un módulo de citas con API:
- POST /api/v1/citas
- GET /api/v1/citas?date=YYYY-MM-DD&user_id=uuid
- PUT /api/v1/citas/{id}
- DELETE /api/v1/citas/{id}

Modelo en SQLAlchemy: `app.models.appointment.Appointment` con estado (`programada`, `cancelada`, `completada`).
Se valida conflicto de horario por fisioterapeuta en la misma franja.

## ⚡ Comandos rápidos:

```bash
# Test de conexión
python -c "from supabase_config import supabase; print('✅ Conexión exitosa!')"

# Crear tablas iniciales
python setup_database.py
```

## 🛠️ Estructura del Backend con Supabase

El backend está configurado para trabajar exclusivamente con Supabase. A continuación, se detalla la estructura y cómo interactuar con ella:

### 1. Configuración del Cliente

El archivo `supabase/supabase_config.py` inicializa el cliente de Supabase utilizando las variables de entorno definidas en `.env`.

```python
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_API_KEY)
```

### 2. Servicios

Los servicios están organizados en la carpeta `services`. Por ejemplo, el archivo `services/user_service.py` contiene las operaciones CRUD para la tabla `users`.

```python
from supabase.supabase_config import supabase

def create_user(email, password):
    return supabase.table("users").insert({"email": email, "password": password}).execute()

def get_user_by_email(email):
    return supabase.table("users").select("*").eq("email", email).execute()

def update_user_password(email, new_password):
    return supabase.table("users").update({"password": new_password}).eq("email", email).execute()

def delete_user(email):
    return supabase.table("users").delete().eq("email", email).execute()
```

### 3. Rutas

Las rutas están definidas en la carpeta `routes`. Por ejemplo, `routes/user_routes.py` expone los endpoints para interactuar con los usuarios.

```python
from fastapi import APIRouter
from services.user_service import create_user, get_user_by_email

router = APIRouter()

@router.post("/users")
def create_user_route(email: str, password: str):
    return create_user(email, password)

@router.get("/users/{email}")
def get_user_route(email: str):
    return get_user_by_email(email)
```

### 4. Integración con FastAPI

El archivo `main.py` configura la aplicación principal de FastAPI e incluye las rutas.

```python
from fastapi import FastAPI
from routes.user_routes import router as user_router

app = FastAPI()

# Incluir rutas
app.include_router(user_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "FisioMove API funcionando correctamente"}
```

### 5. Ejecución

Para iniciar el servidor, ejecuta:

```bash
uvicorn main:app --reload
```

### 6. Pruebas

Puedes probar los endpoints utilizando herramientas como Postman o cURL. Por ejemplo:

- **Crear Usuario**:

  ```bash
  POST /api/v1/users
  {
    "email": "test@example.com",
    "password": "123456"
  }
  ```

- **Obtener Usuario**:
  ```bash
  GET /api/v1/users/test@example.com
  ```
