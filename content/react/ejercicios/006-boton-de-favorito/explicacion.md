## Idea clave

El **estado** es la memoria del componente. Con `useState` guardas un valor que sobrevive entre renders, y **cada vez que lo cambias con su función `set`, React vuelve a ejecutar el componente** y pinta la versión nueva.

## Paso a paso

1. **Importa `useState`** desde `"react"`.
2. **Crea el estado** con `const [activo, setActivo] = useState(false);`. `useState` devuelve un arreglo de dos cosas: el valor actual (`activo`) y la función para cambiarlo (`setActivo`). El `false` es el valor **inicial**, que solo se usa en el primer render.
3. **Escucha el clic** con `onClick` (en camelCase). Le pasas **una función**, no la llamas: `onClick={() => ...}`.
4. **Invierte el valor** con la forma funcional: `setActivo((anterior) => !anterior)`. React te da el valor más reciente en `anterior` y tú devuelves el nuevo.
5. **Pinta según el estado**: el texto con un ternario y `aria-pressed={activo}` para que los lectores de pantalla sepan si el botón está activado.

```jsx
import { useState } from "react";

export function Favorito() {
  const [activo, setActivo] = useState(false);

  return (
    <button aria-pressed={activo} onClick={() => setActivo((anterior) => !anterior)}>
      {activo ? "Quitar de favoritos" : "Agregar a favoritos"}
    </button>
  );
}
```

## Por qué funciona

Cada clic dispara un nuevo render:

| Acción | Estado `activo` | Texto que se pinta | `aria-pressed` |
|---|---|---|---|
| Primer render | `false` (valor inicial) | Agregar a favoritos | `"false"` |
| Clic 1 → `setActivo(false → true)` | `true` | Quitar de favoritos | `"true"` |
| Clic 2 → `setActivo(true → false)` | `false` | Agregar a favoritos | `"false"` |

Lo importante: `setActivo` **no cambia la variable `activo` al instante**. Le pide a React un nuevo render; en ese render nuevo, `useState` devuelve el valor actualizado. Por eso, aunque `activo` es `const`, en cada render tiene el valor correcto: es una variable nueva cada vez que se ejecuta la función.

## Errores comunes

- **Usar una variable normal** (`let activo = false; activo = !activo`). El valor cambia, pero React no se entera y no vuelve a renderizar; y aunque lo hiciera, la variable se reiniciaría a `false`.
- **Llamar la función en vez de pasarla**: `onClick={setActivo(!activo)}`. Se ejecuta **durante el render**, cambia el estado, provoca otro render, y así sin fin: "Too many re-renders".
- **Modificar el estado directamente** (`activo = true`). Es `const` y además React solo reacciona a la función `set`.
- **Esperar el valor nuevo justo después del `set`**: `setActivo(!activo); console.log(activo)` imprime el valor **viejo**. El nuevo llega en el siguiente render.
- **Escribir `onclick` en minúscula.** En JSX los eventos van en camelCase: `onClick`.

## Otra forma de resolverlo

Sin la forma funcional, usando el valor de este render:

```jsx
<button aria-pressed={activo} onClick={() => setActivo(!activo)}>
```

**¿Cuándo conviene?** Aquí funciona igual, porque cada clic genera su propio render. La forma funcional `setX((anterior) => ...)` es la más segura cuando el nuevo valor depende del anterior: si en el mismo evento llamas dos veces `setActivo(!activo)`, las dos usan el mismo `activo` viejo y el resultado es incorrecto; con la forma funcional, cada llamada recibe el valor ya actualizado. Acostúmbrate a usarla siempre que calcules el nuevo estado a partir del anterior.

## Cómo explicarlo en la entrevista

> "Guardo en el estado un booleano `activo` con `useState(false)`. En el clic lo invierto con la forma funcional del setter, que recibe el valor anterior; así no dependo de un valor que podría estar desactualizado. Al cambiar el estado, React vuelve a renderizar y el ternario elige el texto. Además pongo `aria-pressed` para que los lectores de pantalla sepan que es un botón de activar y desactivar."

## Conceptos

- **`useState(inicial)`**: devuelve `[valor, setValor]`; el valor inicial solo se usa en el primer render.
- **Re-render**: llamar a `setValor` hace que React vuelva a ejecutar el componente.
- **Actualización funcional**: `setValor((anterior) => nuevo)` usa siempre el valor más reciente.
- **Eventos en JSX**: `onClick` en camelCase, recibe una función.
- **Inmutabilidad del estado**: nunca se asigna directo; siempre con la función `set`.
- **`aria-pressed`**: indica que un botón es de tipo interruptor y si está activado.
