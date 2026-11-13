Construye un **emisor de eventos** (un "bus") en JavaScript puro y conéctalo a React con un hook que se suscribe y se desuscribe solo.

Exporta tres cosas:

1. **`bus`**: un objeto con:
   - `oyentes`: un objeto donde cada clave es un nombre de evento y su valor es un `Set` de funciones.
   - `on(evento, fn)`: registra `fn` para ese evento y **devuelve una función** que, al llamarla, la quita.
   - `emit(evento, dato)`: llama a todas las funciones registradas en ese evento pasándoles `dato`. Si nadie escucha, no hace nada (no lanza error).
2. **`useEvento(evento, manejar)`**: un hook que se suscribe a `evento` al montar el componente y se desuscribe al desmontarlo.
3. **`Avisos`**: un componente que usa `useEvento("pedido", ...)` y muestra `Último pedido: <dato>`. Al inicio muestra `Último pedido: ninguno`.

## Reglas

- `bus.on` devuelve la función para desuscribirse (no un id ni `true`).
- Si un componente se desmonta, su oyente ya no debe estar en `bus.oyentes`.
- Un evento distinto (por ejemplo `"reclamo"`) **no** cambia lo que muestra `Avisos`.
- El texto exacto es `Último pedido: ` seguido del dato.

## Ejemplo

```jsx
const quitar = bus.on("pedido", (pizza) => console.log("Llegó", pizza));
bus.emit("pedido", "Hawaiana"); // Llegó Hawaiana
quitar();
bus.emit("pedido", "Margarita"); // ya no imprime nada
```

| Acción | `Avisos` muestra |
|---|---|
| (recién montado) | Último pedido: ninguno |
| `bus.emit("pedido", "Hawaiana")` | Último pedido: Hawaiana |
| `bus.emit("reclamo", "Pizza fría")` | Último pedido: Hawaiana |

## Por qué importa

Suscribirse a algo externo (un WebSocket, `window`, una librería) y **limpiar al desmontar** es de lo que más se pregunta sobre `useEffect`. Si no limpias, tienes fugas de memoria y avisos que llegan a componentes que ya no existen. Además, el patrón "publicar y suscribirse" aparece en entrevistas como ejercicio de JavaScript puro.
