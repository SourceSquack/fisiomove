# LoaderComponent

Componente de carga estético que utiliza el isotipo de FisioMove con animaciones fluidas.

## Características

- 🎨 Diseño moderno con el isotipo de FisioMove girando
- 💫 Múltiples anillos animados con diferentes velocidades
- 📱 Responsive y adaptable a diferentes pantallas
- 🌙 Soporte para tema oscuro
- ⚡ Optimizado con animaciones CSS hardware-accelerated
- 🎯 Múltiples variantes de tamaño
- 📝 Mensajes personalizables

## Uso Básico

```typescript
import { LoaderComponent } from "@/components/loader";

@Component({
  // ...
  imports: [LoaderComponent],
})
export class MyComponent {
  isLoading = true;
}
```

```html
<!-- Loader básico -->
@if (isLoading) {
<app-loader message="Cargando datos..."></app-loader>
}
```

## Propiedades

| Propiedad    | Tipo                             | Default         | Descripción                       |
| ------------ | -------------------------------- | --------------- | --------------------------------- |
| `message`    | `string`                         | `'Cargando...'` | Mensaje a mostrar bajo el spinner |
| `fullscreen` | `boolean`                        | `true`          | Si debe ocupar toda la pantalla   |
| `size`       | `'small' \| 'medium' \| 'large'` | `'medium'`      | Tamaño del loader                 |

## Ejemplos de Uso

### Loader de pantalla completa

```html
<app-loader message="Iniciando sesión..." [fullscreen]="true"></app-loader>
```

### Loader inline pequeño

```html
<div class="card">
  @if (isLoading) {
  <app-loader message="Guardando..." [fullscreen]="false" size="small"></app-loader>
  }
</div>
```

### Loader grande para operaciones importantes

```html
<app-loader message="Procesando datos importantes..." size="large"></app-loader>
```

## Estados y Variantes

El componente soporta diferentes estados visuales a través de clases CSS:

- `.loading-success` - Para operaciones exitosas
- `.loading-error` - Para estados de error

## Animaciones

- **Logo**: Animación de pulso suave
- **Anillo principal**: Rotación continua en sentido horario
- **Anillo secundario**: Rotación continua en sentido antihorario
- **Dots**: Animación de pulso secuencial
- **Fondo**: Efecto de gradiente rotativo

## Personalización

Para personalizar los colores o animaciones, modifica las variables CSS en `loader.component.css`:

```css
.spinner-ring {
  border-top: 3px solid var(--primary-color, #007bff);
}
```

## Accesibilidad

- Usa `backdrop-filter` para mejorar la legibilidad
- Colores con suficiente contraste
- Animaciones optimizadas para `prefers-reduced-motion`
- Soporte para tema oscuro automático
