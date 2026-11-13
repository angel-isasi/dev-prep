## Idea clave

`bus.on` **devuelve la función para desuscribirse**. Eso encaja perfecto con `useEffect`, que espera que le devuelvas la limpieza: te suscribes al montar y React llama a la limpieza al desmontar.

## Paso a paso

1. **Dónde guardar a los oyentes.** `oyentes` es un objeto: la clave es el nombre del evento y el valor un `Set` de funciones. El `Set` no repite elementos y permite borrar con `delete(fn)` sin buscar índices.
2. **`on` crea el Set si hace falta.** `this.oyentes[evento] ??= new Set()` significa "si no existe (es `null` o `undefined`), asígnale un Set nuevo". La expresión devuelve el Set, así que puedes encadenar `.add(fn)`.
3. **`on` devuelve la limpieza.** `() => this.oyentes[evento].delete(fn)` es un closure: recuerda `evento` y `fn` aunque `on` ya terminó.
4. **`emit` recorre y llama.** `this.oyentes[evento]?.forEach((fn) => fn(dato))`. El `?.` hace que, si nadie escucha, no pase nada en vez de lanzar `Cannot read properties of undefined`.
5. **El hook.** Dentro de `useEffect` te suscribes y devuelves la función de limpieza. Las dependencias `[evento, manejar]` hacen que, si cambian, React limpie la suscripción vieja y cree una nueva.
6. **El componente.** `Avisos` guarda el último pedido en el estado y le pasa `setUltimo` directamente como manejador.

```jsx
import { useEffect, useState } from "react";

export const bus = {
  oyentes: {},

  on(evento, fn) {
    (this.oyentes[evento] ??= new Set()).add(fn);
    return () => this.oyentes[evento].delete(fn);
  },

  emit(evento, dato) {
    this.oyentes[evento]?.forEach((fn) => fn(dato));
  },
};

export function useEvento(evento, manejar) {
  useEffect(() => {
    const quitar = bus.on(evento, manejar);
    return () => {
      quitar();
    };
  }, [evento, manejar]);
}

export function Avisos() {
  const [ultimo, setUltimo] = useState("ninguno");
  useEvento("pedido", setUltimo);
  return <p>Último pedido: {ultimo}</p>;
}
```

`on` y `emit` se escriben con la sintaxis de método (`on(evento, fn) { ... }`) para que `this` sea el propio `bus`. Dentro de `on`, la función que devuelves es **flecha**, así que hereda ese mismo `this`.

## Por qué funciona

Recorrido de una vida completa de `Avisos`:

| Momento | Qué pasa | `bus.oyentes.pedido` | Pantalla |
|---|---|---|---|
| Primer render | `ultimo = "ninguno"` | (no existe) | Último pedido: ninguno |
| Después de pintar | el efecto llama `bus.on("pedido", setUltimo)` | `Set { setUltimo }` | igual |
| `emit("pedido", "Hawaiana")` | se llama `setUltimo("Hawaiana")`, React vuelve a renderizar | `Set { setUltimo }` | Último pedido: Hawaiana |
| `emit("reclamo", "Pizza fría")` | `oyentes.reclamo` no existe, `?.` corta | `Set { setUltimo }` | Último pedido: Hawaiana |
| Desmontar | React ejecuta la limpieza: `quitar()` | `Set {}` (tamaño 0) | (nada) |

¿Por qué no se vuelve a suscribir en cada render? Porque las dependencias no cambian: `"pedido"` es el mismo texto y `setUltimo` es la misma función siempre (React garantiza que el `set` de `useState` es estable). El efecto corre una sola vez.

## Errores comunes

- **No devolver la limpieza.** El componente se desmonta pero su función sigue en el Set. Al emitir, React avisa que intentas actualizar un componente desmontado y la memoria crece. Lo reconoces porque `bus.oyentes.pedido.size` no baja a 0.
- **Escribir `return quitar()` en vez de `return quitar`** (o `return () => quitar()`). Con los paréntesis la llamas en el acto: te desuscribes apenas te suscribes y nunca recibes avisos.
- **Pasar un manejador nuevo en cada render**, por ejemplo `useEvento("pedido", (p) => setUltimo(p))`. Como la flecha es distinta cada vez, el efecto se limpia y se vuelve a suscribir en cada render. Funciona, pero es trabajo inútil; si necesitas una función propia, envuélvela en `useCallback`.
- **Usar un arreglo en vez de un Set** y borrar con `splice(indexOf(fn), 1)`: si la función no está, `indexOf` da `-1` y `splice(-1, 1)` borra **el último** oyente, que es otro.
- **Olvidar el `?.` en `emit`.** Emitir un evento sin oyentes lanza un error y rompe la app.

## Otra forma de resolverlo

Si el componente necesita leer un **valor** del almacén (no solo reaccionar a avisos), React tiene un hook hecho para eso: `useSyncExternalStore`. Le das una función para suscribirse y otra para leer el valor actual:

```jsx
import { useSyncExternalStore } from "react";

let ultimoPedido = "ninguno";
bus.on("pedido", (pizza) => {
  ultimoPedido = pizza;
});

const suscribir = (avisar) => bus.on("pedido", avisar);
const leer = () => ultimoPedido;

export function Avisos() {
  const ultimo = useSyncExternalStore(suscribir, leer);
  return <p>Último pedido: {ultimo}</p>;
}
```

**¿Cuándo conviene?** Cuando el dato vive fuera de React y varios componentes lo leen (un carrito global, el estado de conexión). Para "avísame cuando pase algo" (mostrar un toast, registrar en consola), `useEffect` + `on` es más simple y fácil de explicar.

## Cómo explicarlo en la entrevista

> "Hice un emisor de eventos con un objeto que guarda un Set de funciones por evento. `on` agrega la función y devuelve otra que la quita; es un closure que recuerda el evento y la función. `emit` recorre el Set con optional chaining para no fallar si nadie escucha. En React lo conecto con un hook: me suscribo dentro de `useEffect` y devuelvo la función de desuscripción como limpieza, así cuando el componente se desmonta no quedan oyentes colgados ni fugas de memoria. Paso `setUltimo` directo porque es estable y el efecto no se repite."

## Conceptos

- **Patrón publicar/suscribir (pub-sub u observer)**: quien emite no sabe quién escucha; solo avisa.
- **`Set`**: colección sin duplicados con `add`, `delete`, `size` y `forEach`.
- **`??=`** (asignación con nulo): asigna solo si el valor actual es `null` o `undefined`.
- **Optional chaining `?.`**: corta la expresión si lo de la izquierda es `null` o `undefined`.
- **Closure**: la función devuelta por `on` recuerda `evento` y `fn`.
- **Limpieza de `useEffect`**: la función que devuelves se ejecuta al desmontar y antes de repetir el efecto.
- **Estabilidad del `set` de `useState`**: nunca cambia, por eso es segura como dependencia.
- **`useSyncExternalStore`**: hook oficial para leer datos que viven fuera de React.
