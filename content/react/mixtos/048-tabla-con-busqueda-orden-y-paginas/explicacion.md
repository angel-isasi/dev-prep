## Idea clave

El estado guarda solo lo que decide el usuario: **texto de búsqueda**, **orden** (`{ campo, asc }`) y **página**. Todo lo demás se deriva en una tubería con un orden fijo: **filtrar, ordenar y al final cortar la página**.

## Paso a paso

1. **Tres estados**: `busqueda` (`""`), `orden` (`{ campo: "cliente", asc: true }`) y `pagina` (`1`).
2. **Filtrar**: normaliza el texto con `trim().toLowerCase()` y quédate con los pedidos cuyo cliente en minúsculas lo `includes`.
3. **Ordenar con `toSorted`**: a diferencia de `sort`, **no muta** el arreglo (y `pedidos` es una prop: nunca la modifiques).
   - Si el valor es número, `a - b` da negativo, 0 o positivo, que es lo que espera el comparador.
   - Si es texto, `localeCompare(otro, "es")` compara según las reglas del español.
   - Para descendente, cambia el signo: `-resultado`.
4. **`useMemo`** sobre filtrar y ordenar, con `[pedidos, busqueda, orden]`. Al cambiar de página no hay que volver a filtrar ni ordenar.
5. **Paginar**:
   - `paginas = Math.max(1, Math.ceil(filtrados.length / porPagina))`. El `Math.max` evita "Página 1 de 0".
   - `actual = Math.min(pagina, paginas)`: si la página guardada ya no existe (por ejemplo, tras filtrar), se usa la última válida.
   - `slice((actual - 1) * porPagina, actual * porPagina)`: página 1 corta de 0 a 2, página 2 de 2 a 4.
6. **`ordenarPor(campo)`**: si es la misma columna, invierte `asc`; si es otra, empieza ascendente.
7. **Al buscar, `setPagina(1)`**: si estabas en la página 3 y ahora hay un solo resultado, lo natural es volver al inicio.
8. **Botones deshabilitados** con `disabled` según `actual`.

```jsx
import { useMemo, useState } from "react";

export function TablaPedidos({ pedidos, porPagina = 2 }) {
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ campo: "cliente", asc: true });
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return pedidos
      .filter((pedido) => pedido.cliente.toLowerCase().includes(texto))
      .toSorted((a, b) => {
        const valorA = a[orden.campo];
        const valorB = b[orden.campo];
        const resultado =
          typeof valorA === "number" ? valorA - valorB : valorA.localeCompare(valorB, "es");
        return orden.asc ? resultado : -resultado;
      });
  }, [pedidos, busqueda, orden]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const actual = Math.min(pagina, paginas);
  const visibles = filtrados.slice((actual - 1) * porPagina, actual * porPagina);

  function ordenarPor(campo) {
    setOrden((anterior) => ({
      campo,
      asc: anterior.campo === campo ? !anterior.asc : true,
    }));
  }

  function buscar(evento) {
    setBusqueda(evento.target.value);
    setPagina(1);
  }

  return (
    <div>
      <input aria-label="Buscar cliente" value={busqueda} onChange={buscar} />

      <table>
        <thead>
          <tr>
            <th>
              <button onClick={() => ordenarPor("cliente")}>Cliente</button>
            </th>
            <th>
              <button onClick={() => ordenarPor("total")}>Total</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibles.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.cliente}</td>
              <td>{pedido.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button disabled={actual === 1} onClick={() => setPagina(actual - 1)}>
        Anterior
      </button>
      <span>
        Página {actual} de {paginas}
      </span>
      <button disabled={actual === paginas} onClick={() => setPagina(actual + 1)}>
        Siguiente
      </button>
    </div>
  );
}
```

## Por qué funciona

Con Rosa (60), Ana (90) y Luis (30), y `porPagina = 2`:

| Acción | `orden` | `filtrados` | `actual` / `paginas` | `visibles` |
|---|---|---|---|---|
| (inicio) | cliente, asc | Ana, Luis, Rosa | 1 / 2 | Ana, Luis |
| Siguiente | cliente, asc | Ana, Luis, Rosa | 2 / 2 | Rosa |
| Anterior + clic Total | total, asc | Luis 30, Rosa 60, Ana 90 | 1 / 2 | Luis, Rosa |
| Clic Total otra vez | total, desc | Ana 90, Rosa 60, Luis 30 | 1 / 2 | Ana, Rosa |
| Buscar "lu" | total, desc | Luis | 1 / 1 | Luis |

¿Por qué el orden de la tubería importa? Si cortaras la página **antes** de ordenar, ordenarías solo las 2 filas visibles: al hacer clic en "Total" en la página 1 verías Ana y Luis reordenados entre ellos, pero nunca a Rosa, que está en la página 2. El usuario espera ver los 2 totales más bajos de **todos** los pedidos.

## Errores comunes

- **Usar `sort` en vez de `toSorted`** directamente sobre `pedidos`: mutas la prop del padre. A veces "funciona", pero el padre ve sus datos reordenados sin saberlo. Si `toSorted` no existiera, usa `[...lista].sort(...)`.
- **Paginar antes de ordenar o filtrar**: el orden solo afecta a la página actual. Lo reconoces porque el mayor total nunca aparece arriba.
- **Comparar números con `localeCompare`** (o como texto): `"100"` queda antes que `"30"` porque se compara letra por letra.
- **No volver a la página 1 al buscar**: estás en la página 2, buscas algo con un solo resultado y ves una tabla vacía. (El `Math.min` también protege de esto, pero volver a 1 es lo esperado).
- **Guardar `visibles` o `paginas` en el estado**: tienes que acordarte de recalcularlos en cada acción; con derivarlos te olvidas del problema.

## Otra forma de resolverlo

Separar la tubería en **funciones puras** fuera del componente, fáciles de probar sin React:

```jsx
const filtrar = (lista, texto) => {
  const t = texto.trim().toLowerCase();
  return lista.filter((p) => p.cliente.toLowerCase().includes(t));
};

const ordenar = (lista, { campo, asc }) =>
  lista.toSorted((a, b) => {
    const r = typeof a[campo] === "number" ? a[campo] - b[campo] : a[campo].localeCompare(b[campo], "es");
    return asc ? r : -r;
  });

const paginar = (lista, pagina, porPagina) =>
  lista.slice((pagina - 1) * porPagina, pagina * porPagina);

// En el componente:
const filtrados = useMemo(() => ordenar(filtrar(pedidos, busqueda), orden), [pedidos, busqueda, orden]);
```

**¿Cuándo conviene?** Cuando la tabla crece (más columnas, filtros por rango, varias tablas parecidas) o cuando quieres tests unitarios de cada paso. Para un ejercicio de entrevista, la versión en un solo componente es más rápida de escribir, pero mencionar esta separación suma puntos. Con miles de filas, además, la búsqueda, el orden y la paginación se hacen en el **servidor** y la tabla solo pide la página que necesita.

## Cómo explicarlo en la entrevista

> "En el estado guardo solo lo que decide el usuario: el texto, el orden como campo más sentido, y la página. Las filas las derivo en una tubería: primero filtro, luego ordeno con `toSorted` para no mutar la prop, comparando números con resta y textos con `localeCompare` en español, y al final corto la página con `slice`. Filtrar y ordenar van en un `useMemo` para no repetirlos al cambiar de página. Al buscar vuelvo a la página 1 y uso `Math.max` y `Math.min` para que nunca diga 'de 0' ni quede en una página que ya no existe."

## Conceptos

- **Estado mínimo** y **estado derivado** (filas visibles, total de páginas, botones deshabilitados).
- **Tubería de datos**: filtrar, ordenar, paginar, en ese orden.
- **`toSorted`**: ordena devolviendo un arreglo nuevo (ES2023), sin mutar.
- **Comparador** `(a, b) => número`: negativo, cero o positivo.
- **`localeCompare(otro, "es")`**: comparar textos con reglas del idioma.
- **Paginación con `slice`** y `Math.ceil`, `Math.max`, `Math.min`.
- **`useMemo`**: evitar recalcular filtrado y orden en renders que no los afectan.
- **Tablas semánticas**: `table`, `thead`, `tbody`, `tr`, `th`, `td`.
