Crea el componente `TablaOrdenable` que recibe en la prop `filas` un arreglo de objetos (todos con las mismas claves, por ejemplo `{ nombre, votos }`) y los muestra en una tabla que se puede **ordenar haciendo clic en el encabezado** de cada columna.

## Reglas

- Una `<table>` con una fila de encabezado (`<thead>`) y una fila (`<tr>`) por objeto en el `<tbody>`.
- Las columnas son las **claves** del primer objeto, en su orden. Cada encabezado `<th>` contiene un `<button>` cuyo texto es el nombre de la clave (por ejemplo `nombre`, `votos`).
- Al inicio, las filas se ordenan por la **primera columna, ascendente**.
- Clic en el encabezado de **otra** columna: ordena por esa columna, ascendente.
- Clic en la columna por la que **ya** se está ordenando: invierte la dirección (ascendente ↔ descendente).
- Los **números** se ordenan como números (7 < 12 < 30) y los **textos** alfabéticamente en español (`"Acción"` va antes que `"Drama"`).
- El `<th>` de la columna ordenada tiene `aria-sort="ascending"` o `"descending"`; los demás, `aria-sort="none"`.
- **No modifiques** el arreglo `filas` que recibes.

## Ejemplo

```jsx
<TablaOrdenable
  filas={[
    { nombre: "Terror", votos: 12 },
    { nombre: "Drama", votos: 30 },
    { nombre: "Acción", votos: 7 },
  ]}
/>
```

| Acción | Orden de la columna `nombre` |
|---|---|
| (al inicio, por nombre ↑) | Acción, Drama, Terror |
| clic en `votos` (↑) | Acción (7), Terror (12), Drama (30) |
| clic en `votos` otra vez (↓) | Drama (30), Terror (12), Acción (7) |
| clic en `nombre` (↑) | Acción, Drama, Terror |

## Por qué importa

Ordenar una tabla es un clásico de pruebas para casa (dashboards, listados). Evalúa si sabes que `sort` **muta** el arreglo, cómo comparar números y textos con tildes, y qué guardar en el estado (la columna y la dirección, no las filas ordenadas).
