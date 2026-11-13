La cocina quiere ver de un vistazo cuántos pedidos hay en cada estado. Exporta:

- `contarPorEstado(pedidos)`: función pura que recibe un arreglo de `{ estado }` y devuelve un objeto `{ estado: cantidad }`.
- `ResumenEstados({ pedidos })`: componente que pinta ese conteo en un párrafo.

## Reglas

- El conteo respeta el **orden en que aparece por primera vez** cada estado.
- `ResumenEstados` pinta un `<p>` con el formato `cantidad estado`, separados por **coma y espacio**: `2 en horno, 1 listo`.
- Si no hay pedidos, el `<p>` dice `Sin pedidos`.
- `contarPorEstado` no modifica el arreglo recibido.

## Ejemplo

```js
contarPorEstado([{ estado: "en horno" }, { estado: "listo" }, { estado: "en horno" }]);
// { "en horno": 2, listo: 1 }
```

```jsx
<ResumenEstados pedidos={[{ estado: "en horno" }, { estado: "listo" }, { estado: "en horno" }]} />
// <p>2 en horno, 1 listo</p>
```

## Por qué importa

Contar ocurrencias con un objeto es de los patrones más pedidos en entrevistas de JavaScript. Aquí lo usas **antes de pintar**: el componente queda con una sola línea de JSX y la lógica se puede probar sola.
