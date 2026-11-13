Tienes una función `estadisticas(pedidos)` que imaginamos **cara** (en la vida real recorrería miles de pedidos). Cada vez que se ejecuta suma 1 al contador exportado `calculos`, para que podamos medir cuántas veces corre. Ya viene escrita en el archivo de inicio.

Crea el componente **`Reporte`** que recibe la prop `pedidos` (un arreglo de objetos `{ monto }`) y muestra sus estadísticas **sin recalcularlas** cuando el componente se vuelve a renderizar por otro motivo.

## Reglas

- Muestra un párrafo con el texto exacto `Total <total>, mayor <mayor>`.
- Tiene un botón que cuenta clics y muestra `Clics: <n>` (empieza en `Clics: 0`). Este botón solo existe para provocar renders.
- `estadisticas` solo debe ejecutarse de nuevo si cambia la prop `pedidos` (otro arreglo). Hacer clic **no** la vuelve a ejecutar.
- Si el padre vuelve a renderizar con **el mismo arreglo** (la misma referencia), tampoco se recalcula.
- Exporta `calculos`, `estadisticas` y `Reporte`.

## Ejemplo

```jsx
<Reporte pedidos={[{ monto: 30 }, { monto: 55 }]} />
```

| Acción | Pantalla | `calculos` aumenta en |
|---|---|---|
| Montar | Total 85, mayor 55 / Clics: 0 | 1 |
| 2 clics | Total 85, mayor 55 / Clics: 2 | 0 |
| El padre pasa otro arreglo `[{ monto: 10 }, { monto: 70 }]` | Total 80, mayor 70 | 1 |

## Por qué importa

"¿Para qué sirve `useMemo` y cuándo lo usarías?" sale en casi toda entrevista de React. Hay que saber que cada cambio de estado vuelve a ejecutar **todo** el componente, y que `useMemo` compara las dependencias por referencia.
