## Idea clave

Un **error boundary** es un componente de clase con el método estático `getDerivedStateFromError`. Cuando un hijo lanza un error al renderizar, React lo llama, el componente guarda `fallo: true` en su estado y en el siguiente render muestra un mensaje en lugar de los hijos. El error queda **aislado** en esa zona.

## Paso a paso

1. **Extiende `Component`**: `class LimiteDeError extends Component`. No hay un hook equivalente, por eso este es el único caso en que un proyecto moderno sigue escribiendo clases.
2. **Estado inicial** como campo de clase: `state = { fallo: false }`. Es lo mismo que `useState(false)` en un componente de función.
3. **`static getDerivedStateFromError()`**: React lo llama cuando un descendiente lanza durante el render. Devuelve el **cambio** de estado (`{ fallo: true }`). Es `static` porque no tiene acceso a `this`: solo calcula el estado nuevo.
4. **`render()`**: si `this.state.fallo`, devuelve el `<p role="alert">`; si no, `this.props.children`. `role="alert"` hace que el lector de pantalla lo anuncie de inmediato.
5. **Opcional, `componentDidCatch(error, info)`**: se llama después, con el error y la pila de componentes. Es el lugar para registrar el fallo en la consola o enviarlo a un servicio de monitoreo (como Sentry).

```jsx
import { Component } from "react";

export class LimiteDeError extends Component {
  // Estado inicial: todavía no hubo error.
  state = { fallo: false };

  // React lo llama cuando un hijo lanza un error al renderizar.
  // Lo que devuelve se mezcla con el estado, y luego se vuelve a renderizar.
  static getDerivedStateFromError() {
    return { fallo: true };
  }

  // Opcional: buen lugar para registrar el error (consola, servicio de monitoreo).
  componentDidCatch(error, info) {
    console.error("Error atrapado por LimiteDeError:", error, info.componentStack);
  }

  render() {
    if (this.state.fallo) {
      return <p role="alert">Algo salió mal. Recarga la página.</p>;
    }
    return this.props.children;
  }
}
```

## Por qué funciona

Con `<LimiteDeError><Rota /></LimiteDeError>`:

| Momento | `this.state.fallo` | Lo que pasa | Se pinta |
|---|---|---|---|
| Primer render del límite | `false` | devuelve `children`, React intenta renderizar `Rota` | (nada todavía) |
| `Rota` lanza `Error("boom")` | `false` | React busca hacia arriba el boundary más cercano y llama a `getDerivedStateFromError` | |
| Se aplica `{ fallo: true }` | `true` | React vuelve a renderizar el límite | Algo salió mal. Recarga la página. |
| `componentDidCatch` | `true` | registra el error | (igual) |

React busca el **límite más cercano hacia arriba** del componente que falló, igual que un `try/catch` atrapa los errores de lo que tiene adentro. Por eso, con dos límites hermanos, solo el que contiene a `Rota` muestra el mensaje y el otro sigue mostrando "Promociones". Lo que está fuera de todos los límites (el `<h1>`) no se entera.

Sin ningún límite, React desmonta **todo el árbol** ante un error de render: la pantalla queda en blanco. React prefiere eso a mostrar una interfaz rota a medias.

## Errores comunes

- **Olvidar `static`** en `getDerivedStateFromError`. React no lo reconoce como método especial y el error no se atrapa. Lo reconoces porque falla el test del alert y aparece el error "boom".
- **Intentar hacerlo con un componente de función y `try/catch`.** Un `try/catch` alrededor del JSX no atrapa errores de los hijos, porque los hijos se renderizan después, no dentro de tu función.
- **Esperar que atrape todo.** Un error boundary **no** atrapa errores en manejadores de eventos (`onClick`), en código asíncrono (`setTimeout`, promesas) ni en el propio boundary. Para eventos usas `try/catch` normal.
- **Devolver `this.state.children`** en vez de `this.props.children`. Los hijos llegan por props.
- **Poner un solo límite en la raíz de toda la app.** Funciona, pero cualquier error tumba todo. Lo ideal es poner límites por secciones (barra lateral, contenido, widget) para que un fallo no se lleve lo demás.

## Otra forma de resolverlo

Hacerlo **reutilizable** con un `fallback` personalizado y un botón para reintentar:

```jsx
import { Component } from "react";

export class LimiteDeError extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  reintentar = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div role="alert">
            <p>Algo salió mal. Recarga la página.</p>
            <button onClick={this.reintentar}>Reintentar</button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

**¿Cuándo conviene?** En una app real con varias secciones, cada una con su propio mensaje. Muchos equipos usan la librería `react-error-boundary`, que ofrece esto ya hecho con un componente `ErrorBoundary` y un hook `useErrorBoundary` para atrapar también errores asíncronos.

## Cómo explicarlo en la entrevista

> "Un error boundary es un componente de clase que implementa `getDerivedStateFromError`. Cuando un hijo lanza un error al renderizar, React busca el límite más cercano hacia arriba, ese método pone `fallo: true` en el estado, y el render muestra un mensaje en vez de los hijos. Así un bug en un componente no deja la pantalla en blanco. Con `componentDidCatch` registro el error. Hay que recordar que no atrapa errores en eventos ni en código asíncrono, y que conviene poner límites por secciones."

## Conceptos

- **Error boundary**: componente que atrapa errores de render de sus descendientes.
- **Componente de clase**: `class X extends Component` con `render()`, `this.props` y `this.state`.
- **`static getDerivedStateFromError`**: devuelve el estado a aplicar cuando un hijo falla.
- **`componentDidCatch`**: para registrar el error (efecto secundario).
- **Qué NO atrapa**: errores en eventos, en código asíncrono y en el propio boundary.
- **`role="alert"`**: anuncia el mensaje a los lectores de pantalla.
- **Aislar fallos**: límites por sección para que un error no tumbe toda la app.
