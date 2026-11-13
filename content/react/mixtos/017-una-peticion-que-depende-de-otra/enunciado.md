A veces una petición **necesita el resultado de otra**: para pedir los pedidos de un usuario, primero necesitas saber quién es (su `id`). Crea el componente `MisPedidos` que hace las dos peticiones **en orden**.

## Reglas

- Exporta `MisPedidos({ api })`. `api` tiene dos funciones asíncronas:
  - `api.usuario()` devuelve `{ id, nombre }`.
  - `api.pedidosDe(id)` devuelve un arreglo con los pedidos de ese usuario.
- Al montar: pide el usuario y, **con su `id`**, pide sus pedidos.
- Muestra un solo `<p>`:
  - Mientras carga: `Cargando…`
  - Al terminar: `{nombre} tiene {n} pedidos` (por ejemplo, `Angel tiene 2 pedidos`).
  - Si **cualquiera** de las dos falla: `No pudimos cargar tus pedidos`.
- Si `api.usuario()` falla, **no** llames a `api.pedidosDe`.
- No actualices el estado si el componente ya se desmontó.

## Ejemplo

```jsx
const api = {
  usuario: async () => ({ id: 7, nombre: "Angel" }),
  pedidosDe: async (id) => [101, 102], // pedidos del usuario 7
};

<MisPedidos api={api} />
// Cargando…  ->  Angel tiene 2 pedidos
```

## Por qué importa

Es el caso contrario a `Promise.all`: aquí **sí** hay dependencia, así que hay que esperar. La pregunta típica es "¿cómo uso `async/await` dentro de un `useEffect` si el efecto no puede ser `async`?". La respuesta (una función async interna) y el manejo de errores con `try/catch` son imprescindibles.
