# Fisiomove - Frontend

## Descripción

Sección visual del aplicativo **Fisiomove**, un sistema de ccontrol destinado a consultorios de fisioterapia para el control de pacientes, personal interno, gestión de citas, historial médico y demás funciones que puedan resultar en el desarrollo de la práctica fisioterapeutica.

### Funcionalidades principales

- Registro / Login
- Dashboard
- Calendario
- Regsitro de pacientes
- Control de citas

## Requisitos previos

- **Node.js**: v20.x o superior
- **npm**: v10.x o superior
- **Angular CLI**: v20.x (`npm install -g @angular/cli@20`)
- Navegador moderno (Chrome, Firefox, Edge)

## Tecnologías usadas

| Tecnología | Versión inicial | Propósito |
|------------|---------|-----------|
| Angular | 20.0.x | Framework web |
| TypeScript | 5.6.x | Tipado estático y compilación |
| RxJS | 7.8.x | Manejo de flujos asíncronos |
| NgRx | 20.0.x | Gestión de estado global |
| font-awesome | 6.4.x | Íconos |
| Bulma io | 1.0.x | Librería CSS |
| AG Grid | 34.1.x | Librería de construcción de tablas para Angular |

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── component/
│   │   │       ├── ...component.ts
│   │   │       ├── ...component.html
│   │   │       └── ...component.css
│   │   ├── core/
│   │   │   ├── config/
│   │   │   ├── guards/
│   │   │   │   └── ....guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── ....interceptor.ts
│   │   │   ├── models/
│   │   │   │   └── ....model.ts
│   │   │   ├── services/
│   │   │   │   └── ....service.ts
│   │   │   └── stores/
│   │   │       └── ...store.ts
│   │   ├── pages/
│   │   │   └── page/
│   │   │       ├── ...Page.component.ts
│   │   │       ├── ...Page.component.html
│   │   │       └── ...Page.component.css
│   │   ├── app.component.ts
│   │   ├── app.config.server.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── main.ts
├── angular.json
├── package.json
└─ server.ts
```
