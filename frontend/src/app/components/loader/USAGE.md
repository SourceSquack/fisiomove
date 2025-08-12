# Guía de Uso del Loader Global

## Implementación Actual (Recomendada)

### Loader Conectado al AuthStore

El loader está integrado globalmente en `AppComponent` y se muestra automáticamente cuando `authStore.isLoading()` es `true`.

**Ventajas:**
✅ No necesitas importar el loader en cada componente
✅ Se activa automáticamente durante operaciones de auth
✅ Mensajes contextuales según la ruta
✅ Completamente escalable

**Cómo funciona:**

```typescript
// En cualquier componente que use AuthStore
export class LoginComponent {
  private authStore = inject(AuthStore);

  onSubmit() {
    // El loader se muestra automáticamente cuando isLoading = true
    this.authStore.login(credentials);
    // El loader se oculta automáticamente cuando isLoading = false
  }
}
```

### Mensajes Contextuales

El loader muestra diferentes mensajes según la ruta actual:

- `/login` → "Iniciando sesión..."
- `/register` → "Creando cuenta..."
- `/dashboard` → "Cargando dashboard..."
- Por defecto → "Cargando..."

## Alternativa: LoaderService (Para casos especiales)

Para operaciones que no están relacionadas con autenticación, puedes usar el `LoaderService`:

```typescript
import { LoaderService } from "@/core/services/loader.service";

export class DataComponent {
  private loaderService = inject(LoaderService);

  async loadData() {
    this.loaderService.show("Cargando datos...");
    try {
      const data = await this.dataService.fetchData();
      this.loaderService.showSuccess("Datos cargados exitosamente");
    } catch (error) {
      this.loaderService.showError("Error al cargar datos");
    }
  }

  async saveData() {
    this.loaderService.showSaving();
    // ... lógica de guardado
    this.loaderService.hide();
  }
}
```

### Métodos Disponibles en LoaderService

```typescript
// Básicos
loaderService.show("Mensaje personalizado");
loaderService.hide();

// Contextuales
loaderService.showLogin();
loaderService.showRegister();
loaderService.showSaving();

// Con auto-hide
loaderService.showSuccess("¡Éxito!"); // Se oculta en 2s
loaderService.showError("Error"); // Se oculta en 3s

// Personalizados
loaderService.show("Procesando...", "default", "large");
```

## Integración con el AppComponent

```html
<!-- app.component.html -->
@if (!isDashboardRoute) {
<app-navbar />
}
<router-outlet />
<app-footer />

<!-- Loader Global Automático -->
@if (authStore.isLoading()) {
<app-loader [message]="getLoadingMessage()" [fullscreen]="true"></app-loader>
}

<!-- Loader Manual (opcional) -->
@if ((loaderService.loaderState$ | async)?.isVisible) {
<app-loader [message]="(loaderService.loaderState$ | async)?.message" [fullscreen]="true"></app-loader>
}
```

## Estados de Carga Recomendados

### 1. Autenticación (Automático)

- Login/logout
- Registro
- Verificación de token
- Cambio de contraseña

### 2. Operaciones CRUD (Manual con LoaderService)

- Crear/editar/eliminar registros
- Cargar listas de datos
- Subir archivos

### 3. Navegación (Automático)

- Cambio de rutas con datos
- Inicialización de dashboard

## Best Practices

1. **Usa el loader automático** para auth (ya está configurado)
2. **Usa LoaderService** para operaciones específicas
3. **Personaliza mensajes** para mejor UX
4. **No abuses del loader** - solo para operaciones >500ms
5. **Siempre oculta el loader** en catch/finally

## Personalización Visual

### Estados de Color

```css
/* En loader.component.css */
.loader-overlay.loading-success {
  background: rgba(40, 167, 69, 0.1);
}

.loader-overlay.loading-error {
  background: rgba(220, 53, 69, 0.1);
}
```

### Tamaños

- `small`: Para operaciones menores (guardar, etc.)
- `medium`: Para operaciones normales (default)
- `large`: Para operaciones importantes (login, carga inicial)

## Migración de Componentes Existentes

Si tienes loaders en componentes específicos:

```typescript
// ANTES ❌
export class MyComponent {
  isLoading = false;

  async doSomething() {
    this.isLoading = true;
    // ... operación
    this.isLoading = false;
  }
}
```

```typescript
// DESPUÉS ✅
export class MyComponent {
  private loaderService = inject(LoaderService);

  async doSomething() {
    this.loaderService.show("Procesando...");
    try {
      // ... operación
      this.loaderService.showSuccess("¡Completado!");
    } catch (error) {
      this.loaderService.showError("Error en la operación");
    }
  }
}
```

## Resultado

Con esta implementación:

- ✅ Un solo loader global
- ✅ Automático para autenticación
- ✅ Manual para operaciones específicas
- ✅ Completamente escalable
- ✅ Sin imports repetitivos
- ✅ UX consistente en toda la app
