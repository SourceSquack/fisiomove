# Guía de Setup Local – FisioMove

Esta guía explica cómo preparar y ejecutar el proyecto localmente.

---

## 🚀 Quickstart

### Windows (PowerShell)

```powershell
# 1) Ejecutar el script de setup (desde la raíz del repo)
./setup.ps1

# 2) (Opcional) Iniciar servidores de desarrollo (backend y frontend)
./setup.ps1 -StartDev
```

### Linux/macOS

Actualmente no hay un script `setup.sh` incluido. Puedes preparar el entorno con pasos manuales:

- Backend: crear un entorno virtual de Python, instalar `requirements.txt` y lanzar uvicorn.
- Frontend: instalar dependencias con npm y ejecutar `npm start`.

Sección “Manual (Linux/macOS)” más abajo con detalles.

---

## 🛠️ Prerrequisitos

- Windows PowerShell 5.1 o superior (para usar `setup.ps1`)
- Node.js 18.19.x, 20.9.x o 22.x (requerimiento de Angular 20) — incluye npm
- Python ≥ 3.10 (recomendado); pip

Nota: probado con Node v22.14.0 y npm 11.4.2; backend venv con Python 3.13.3.

El script comprobará Node, npm, Python y pip. No instala Ollama/uv ni dependencias externas no utilizadas en este proyecto.

---

## 🔧 Configuración de entorno (.env)

- Backend: si existe `backend/.env.example` y falta `backend/.env`, el script creará `backend/.env` automáticamente copiando del ejemplo.
- Frontend: actualmente no requiere `.env` (Angular usa configuración propia). Si agregas variables, documenta su ubicación y formato.

---

## 📦 Pasos de Instalación (Windows)

1. Ejecutar el setup desde la raíz del repo:

```powershell
./setup.ps1
```

Este script:

- Verifica Node/npm/Python/pip.
- Crea un entorno virtual en `backend/venv` (si no existe).
- Instala dependencias de backend desde `backend/requirements.txt` (dentro del venv).
- Instala dependencias del frontend (Angular) con `npm ci` (o `npm install` si no hay lockfile).

2. (Opcional) Iniciar servidores de desarrollo automáticamente:

```powershell
./setup.ps1 -StartDev
```

Esto abre dos ventanas de PowerShell:

- Backend: uvicorn `app.main:app` en `http://127.0.0.1:8000`
- Frontend: `npm start` (Angular) usando tu puerto por defecto (p. ej., 4200)

3. (Alternativa manual) Arrancar por separado

Backend:

```powershell
# Desde la raíz del repo
cd backend
# Usar Python del venv creado por el setup
./venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm start
```

---

## 🧪 Tests

Ejecutar la suite de tests (pytest) desde la raíz o dentro de `backend/`:

```powershell
# Desde la raíz
pytest

# O dentro de backend/
cd backend
pytest
```

Los tests incluyen logs informativos en consola para entender cada verificación.

---

## 🐞 Problemas Comunes (Windows)

- “Execution of scripts is disabled on this system”:

  - Ejecuta PowerShell como Administrador y corre:

  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

- Puertos ocupados (8000 o del frontend):

  - Cambia el puerto de uvicorn con `--port 8001` o el puerto de Angular con argumentos de CLI.

- pip no disponible:
  - Asegura que `python -m ensurepip -U` y `python -m pip --version` funcionan; si falla, reinstala Python con “Add to PATH”.

---

## 🐧 Manual (Linux/macOS)

Backend:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm ci # o npm install
npm start
```

Tests:

```bash
# Desde la raíz o backend/
pytest
```

---

## 🔨 Comandos Útiles

- `./setup.ps1` — Setup completo (Windows)
- `./setup.ps1 -StartDev` — Setup + arranque de backend y frontend
- Backend (manual): `./backend/venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000`
- Frontend: `cd frontend && npm start`
- Tests: `pytest`

---

Última actualización: Agosto 2025
