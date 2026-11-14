Crea el formulario de registro `FormularioRegistro` con React y TypeScript: **estado tipado**, **eventos tipados** y una función de validación aparte. Es el componente que más se pide en pruebas técnicas de frontend junior.

## Tipos

- `Formulario`: `{ nombre: string; email: string; password: string }`.
- `ErroresFormulario`: como mucho un mensaje por campo de `Formulario` (usa `Partial`, `Record` y `keyof`).

## Reglas

**`validarFormulario(datos: Formulario): ErroresFormulario`**, una función pura (no toca React):

| Campo | Falla si | Mensaje |
|---|---|---|
| `nombre` | está vacío o tiene solo espacios | `"El nombre es obligatorio"` |
| `email` | no tiene la forma `algo@algo.algo` | `"El email no es válido"` |
| `password` | tiene menos de 8 caracteres | `"La contraseña debe tener al menos 8 caracteres"` |

Los campos sin error no aparecen. Si todo está bien, devuelve `{}`.

**`FormularioRegistro({ onRegistrar })`**, donde `onRegistrar: (datos: Formulario) => void`:

- Un `<form>` con tres inputs, cada uno con su `<label>` asociado (`htmlFor` + `id`): **Nombre**, **Email** y **Contraseña** (este con `type="password"`).
- Los inputs son **controlados**: su `value` sale del estado (`useState<Formulario>`) y `onChange` lo actualiza.
- Un botón `<button type="submit">Registrarme</button>`.
- Al enviar: evita que la página se recargue, valida y guarda los errores en el estado.
  - Si hay errores, muestra cada mensaje debajo de su campo y **no** llama a `onRegistrar`.
  - Si no hay errores, llama a `onRegistrar(datos)` y no se ve ningún mensaje.
- Tipa los manejadores: `ChangeEvent<HTMLInputElement>` para los cambios y `SubmitEvent<HTMLFormElement>` para el envío (los dos se importan de `"react"`).

## Ejemplo

```tsx
<FormularioRegistro onRegistrar={(datos) => api.registrar(datos)} />
```

| Acción | Se ve |
|---|---|
| clic en Registrarme con todo vacío | los 3 mensajes de error |
| escribe "Angel", "angel@correo.pe" y "secreta123", clic en Registrarme | sin errores; se llama `onRegistrar({ nombre: "Angel", email: "angel@correo.pe", password: "secreta123" })` |

```ts
validarFormulario({ nombre: "  ", email: "a@b.pe", password: "corta" });
// { nombre: "El nombre es obligatorio", password: "La contraseña debe tener al menos 8 caracteres" }
```

## Por qué importa

Un formulario junta casi todo lo que se evalúa en una prueba de React: estado, eventos, renderizado condicional y validación. Con TypeScript se agrega la pregunta "¿qué tipo tiene `e` en un `onChange`?", que mucha gente responde con `any`. Separar la validación en una función pura además muestra criterio: se prueba sola y se reutiliza (por ejemplo, en el servidor).
