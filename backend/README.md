# FisioMove - Backend

Este directorio contiene la API backend de FisioMove (FastAPI + SQLAlchemy + Supabase). Este documento describe qué es el proyecto, cómo funciona y recomendaciones prácticas y acciones para endurecer la seguridad y operación (Blue Team / Hardening).

## Resumen del proyecto

- Stack: Python 3.11+ (recomendado), FastAPI, SQLAlchemy, Alembic, Supabase (servicio PaaS). Las dependencias se definen en `requirements.txt`.
- Propósito: Proveer una API REST (v1) para la gestión de pacientes, citas, historiales y autenticación para la aplicación FisioMove.
- Estructura principal:
  - `app/` – código de la aplicación (routers, modelos, servicios, DB)
  - `routes/` – rutas rápidas (legacy/compat)
  - `supabase_config.py` – creación del cliente de Supabase
  - `setup_database.py`, scripts de utilidades y pruebas

## Cómo funciona (alto nivel)

- Al iniciar, `app/main.py` crea las tablas con SQLAlchemy (`Base.metadata.create_all`) y registra rutas en `api_v1`.
- La configuración se carga mediante `app/core/config.py` apoyada en variables de entorno (`.env`).
- La persistencia puede ser SQLite local o Postgres (via `DATABASE_URL`).
- Supabase se usa desde `supabase_config.py` para autenticación/operaciones (client-side server calls).

## Primeros pasos (desarrollo)

1. Crear un entorno virtual y activar.
2. Instalar dependencias:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
```

3. Copiar `.env.example` a `.env` y completar variables críticas (DB, SUPABASE\_\* , SECRET_KEY).
4. Ejecutar la aplicación en modo desarrollo:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Endpoints principales:

- `GET /health` – estado
- Prefijo API: por defecto `API_V1_STR = /api/v1` (configurable)

## Riesgos observados (resumen rápido)

- Valores por defecto inseguros en `app/core/config.py`: `SECRET_KEY` por defecto `CHANGE_ME`, `CORS_ORIGINS` permite `*`, `DEV_BYPASS_EMAIL_CONFIRM` habilitado.
- Cliente Supabase inicializado globalmente al importar `supabase_config.py` (posible exposición de claves si el módulo se importa en entornos no seguros o se filtran logs).
- Endpoints de creación de usuario (`routes/user_routes.py`) no validan entrada ni aplican rate limiting ni verificación de email.
- Uso de `.create_all()` en arranque puede ocultar problemas de migraciones; use Alembic para migraciones en producción.

## Recomendaciones prácticas y medidas (lista accionable, priorizadas)

Prioridad Alta (implementar antes de desplegar a producción):

1. Secrets y gestión:

   - Establecer `SECRET_KEY` fuerte mediante variable de entorno. Nunca usar el valor por defecto.
   - Nunca incluir claves en el repositorio. Usar gestor de secretos (Azure KeyVault, AWS Secrets Manager, HashiCorp Vault) o variables de entorno gestionadas por CI/CD.
   - `SUPABASE_SERVICE_ROLE_KEY` sólo en backend y nunca en cliente/public.

2. Autenticación y sesiones:

   - Validar y sanitizar correo y contraseñas. Requerir contraseñas robustas y utilizar hashing con salt (`passlib[bcrypt]` o Argon2 si posible).
   - Deshabilitar `DEV_BYPASS_EMAIL_CONFIRM` en producción.

3. CORS y exposición:

   - No usar `CORS_ORIGINS=['*']` en producción. Configurar orígenes específicos y mínimos.

4. Comunicación segura:

   - Forzar HTTPS. Para PostgreSQL, exigir `sslmode=require` (config actual ya lo añade si detecta postgresql). Asegurarse de que todas las llamadas a Supabase usen HTTPS.

5. Limitación de tasa y protección contra abuso:

   - Implementar rate limiting (p. ej. `slowapi` o middleware propio) para endpoints sensibles (login, sign-up, reset).
   - Implementar reCAPTCHA / challenge en endpoints de creación de cuentas cuando proceda.

6. Registro, monitoreo y detección:

   - Centralizar logs en formato estructurado (JSON) y enviarlos a un SIEM / observabilidad (ELK, Datadog, Splunk).
   - Registrar intentos de autenticación fallidos y alertar en umbrales.
   - Exportar métricas (Prometheus) y configurar dashboards/alertas.

7. Escaneo y seguridad en CI:

   - Integrar `pip-audit` y `safety`/`dependabot` para deps.
   - Ejecutar `bandit` para detectar patrones inseguros en Python.
   - Escanear imágenes con `trivy` y Dockerfile lint con `hadolint` si se usan contenedores.

8. Base de datos y migraciones:

   - No usar `metadata.create_all()` en producción; use Alembic para migraciones controladas.
   - Revisar y restringir roles/privilegios de la BD y evitar credenciales con permisos excesivos.

9. Hardening del runtime:

   - Ejecutar proceso como usuario no-root en contenedores.
   - Establecer límites de recursos y políticas de seguridad (seccomp, read-only FS).

10. Validación y saneamiento:

- Validar toda entrada con Pydantic y limitar tamaños de payload.
- Escapar o validar cualquier HTML/markdown enviado por usuarios para prevenir XSS.

Medidas adicionales (de diseño):

- Usar JWT con rotación de claves y revocación (blacklist short-lived + refresh tokens).
- Implementar pruebas de seguridad (DAST) periódicamente y pentesting trimestral.
- Usar CSP, HSTS y headers seguros (via middleware, p. ej. Starlette middleware o proxy inverso).

## Checklist rápido antes de producción

- [ ] SECRET_KEY configurado y seguro
- [ ] CORS restringido a orígenes necesarios
- [ ] DEV_BYPASS_EMAIL_CONFIRM deshabilitado
- [ ] Rate limiting y protección contra fuerza bruta implementados
- [ ] Logs centralizados y alertas básicas configuradas
- [ ] Dependencias escaneadas y aprobadas
- [ ] Migraciones gestionadas por Alembic (no create_all en prod)
- [ ] Supabase service role key no expuesto en clientes

## Comandos útiles

- Instalar dependencias:

```powershell
pip install -r requirements.txt
```

- Ejecutar análisis de dependencias (ejemplo):

```powershell
pip install pip-audit bandit
pip-audit; bandit -r app
```

- Escaneo de imagen (si usa Docker):

```powershell
trivy image myregistry/myimage:tag
```

## Próximos pasos sugeridos

1. Revisar y aplicar las medidas críticas (Secrets, CORS, Dev flags).
2. Añadir pruebas automáticas de seguridad en CI (bandit, pip-audit, trivy).
3. Implementar rate limiting y protecciones contra abuso.
4. Preparar runbook para incidentes de seguridad (qué hacer si hay una filtración de credenciales).

---

Documentado por: Equipo FisioMove (Guía de hardening inicial y checklist de Blue Team)
