Crea el componente `TablaPedidos` que muestra pedidos en una tabla con **búsqueda**, **orden por columna** y **páginas**. Recibe:

- `pedidos`: arreglo de `{ id, cliente, total }`.
- `porPagina`: cuántas filas por página (opcional, por defecto `2`).

## Reglas

- Un input con `aria-label="Buscar cliente"`. Filtra por nombre de cliente, sin distinguir mayúsculas e ignorando espacios a los lados. Al escribir, se vuelve a la **página 1**.
- Una `<table>` con un `<thead>` de dos columnas. Cada encabezado es un botón: **"Cliente"** y **"Total"**. En el `<tbody>`, una fila `<tr>` por pedido visible, con dos celdas `<td>`: cliente y total.
- **Orden**: al inicio, por cliente de la A a la Z. Clic en una columna distinta ordena por ella de forma ascendente; clic en la misma columna invierte el sentido. Los textos se comparan en español (`localeCompare`) y los números como números.
- **Páginas**: se ven solo las filas de la página actual. Debajo, un botón **"Anterior"**, el texto **"Página {actual} de {total}"** y un botón **"Siguiente"**. "Anterior" está deshabilitado en la primera página y "Siguiente" en la última.
- Si la búsqueda no encuentra nada, la tabla queda sin filas y se ve "Página 1 de 1" (nunca "de 0").
- El orden de las operaciones importa: **filtrar, ordenar y después cortar la página**.

## Ejemplo

```jsx
const pedidos = [
  { id: 1, cliente: "Rosa", total: 60 },
  { id: 2, cliente: "Ana", total: 90 },
  { id: 3, cliente: "Luis", total: 30 },
];

<TablaPedidos pedidos={pedidos} />
```

| Acción | Filas | Pie |
|---|---|---|
| (inicio) | Ana, Luis | Página 1 de 2 |
| Siguiente | Rosa | Página 2 de 2 |
| Anterior, clic en "Total" | Luis (30), Rosa (60) | Página 1 de 2 |
| Otro clic en "Total" | Ana (90), Rosa (60) | Página 1 de 2 |
| Buscar "lu" | Luis | Página 1 de 1 |

## Por qué importa

Las tablas de datos están en casi todo panel administrativo, y "agrégale búsqueda, orden y paginación" es una ampliación típica en una entrevista en vivo. Lo que evalúan es si guardas solo lo indispensable en el estado (texto, orden, página) y derivas el resto en el orden correcto.
