# FisioMove 🏥

## Descripción del Proyecto

FisioMove es una aplicación web completa para la gestión de consultorios de fisioterapia. Permite la administración de pacientes, citas, historiales clínicos y notificaciones, con diferentes roles de usuario (administradores, fisioterapeutas y pacientes).

## 🏗️ Arquitectura del Proyecto

### Frontend (Angular)

- **Framework**: Angular + Angular Material + RxJS
- **Componentes principales**:
  - Página pública (homepage, login)
  - Frontend protegido para administración, fisioterapeutas y pacientes
  - Módulos: auth, dashboard, citas, pacientes, historial, notificaciones, shared
- **Características**:
  - TypeScript estricto
  - Diseño responsive (móvil, tablet)
  - Componentes reutilizables
  - Rutas protegidas con roles

### Backend (FastAPI)

- **Stack**: FastAPI + Python 3.11 + PostgreSQL + SQLAlchemy/Alembic + Pydantic
- **Estructura modular**:
  - Módulos: auth, citas, pacientes, historial, notificaciones, core, dashboard
- **Características**:
  - Python tipado con Pydantic para validación
  - Autenticación JWT con roles
  - Endpoints CRUD completos
  - Manejo de errores global
  - Tests con pytest

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18+)
- Python 3.11+
- PostgreSQL
- Git

### Backend Setup

```bash
# Clonar el repositorio
git clone https://github.com/SourceSquack/fisiomove.git
cd fisiomove/backend

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos
# Crear archivo .env con las variables de entorno
cp .env.example .env

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor de desarrollo
uvicorn main:app --reload
```

### Frontend Setup

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```

## 📁 Estructura del Proyecto

```
fisiomove/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── citas/
│   │   ├── pacientes/
│   │   ├── historial/
│   │   ├── notificaciones/
│   │   ├── core/
│   │   └── dashboard/
│   ├── tests/
│   ├── alembic/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── citas/
│   │   │   ├── pacientes/
│   │   │   ├── historial/
│   │   │   ├── notificaciones/
│   │   │   └── shared/
│   │   └── assets/
│   └── package.json
└── README.md
```

## 🔧 Scripts Disponibles

### Backend

- `uvicorn main:app --reload` - Servidor de desarrollo
- `pytest` - Ejecutar tests
- `alembic upgrade head` - Aplicar migraciones
- `alembic revision --autogenerate -m "mensaje"` - Crear nueva migración

### Frontend

- `ng serve` - Servidor de desarrollo
- `ng build` - Build de producción
- `ng test` - Ejecutar tests unitarios
- `ng e2e` - Tests end-to-end
- `ng lint` - Linter

## 🔐 Roles de Usuario

- **Administrador**: Gestión completa del sistema, usuarios y configuración
- **Fisioterapeuta**: Gestión de pacientes, citas y historiales clínicos
- **Paciente**: Visualización de citas, historial y perfil personal

## 🧪 Testing

### Backend

```bash
# Ejecutar todos los tests
pytest

# Ejecutar tests con coverage
pytest --cov=app

# Ejecutar tests específicos
pytest tests/test_auth.py
```

### Frontend

```bash
# Tests unitarios
ng test

# Tests e2e
ng e2e

# Tests con coverage
ng test --code-coverage
```

## 📝 Variables de Entorno

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost/fisiomove
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DELTA=30
CORS_ORIGINS=http://localhost:4200
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8000/api",
  jwtTokenKey: "fisiomove_token",
};
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Repositorio**: [https://github.com/SourceSquack/fisiomove](https://github.com/SourceSquack/fisiomove)
- **Issues**: [https://github.com/SourceSquack/fisiomove/issues](https://github.com/SourceSquack/fisiomove/issues)

## 🔄 Estado del Proyecto

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
