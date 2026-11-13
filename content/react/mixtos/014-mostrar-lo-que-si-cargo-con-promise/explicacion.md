## Idea clave

`Promise.allSettled` espera a **todas** las promesas y **nunca se rechaza**: te da un informe por cada una (`fulfilled` con su `value` o `rejected` con su `reason`). Así pintas lo que sí llegó y marcas lo que falló, en lugar de perderlo todo.

## Paso a paso

1. **Estado** `resultados`, que empieza en `null` (cargando).
2. **En el efecto**, `fuentes.map((fuente) => fuente.cargar())` llama a todas a la vez y te da un arreglo de promesas.
3. **`Promise.allSettled(promesas)`** espera a que todas terminen. No hace falta `.catch`: aunque una falle, `allSettled` se cumple igual.
4. **Guarda el informe** en el estado (si el efecto sigue vigente).
5. **Pinta**: los resultados vienen **en el mismo orden** que las fuentes, así que `resultados[i]` corresponde a `fuentes[i]`. Según `status`, muestras el valor o "no disponible".

```jsx
import { useEffect, useState } from "react";

export function Tablero({ fuentes }) {
  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    let vigente = true;

    Promise.allSettled(fuentes.map((fuente) => fuente.cargar())).then((lista) => {
      if (vigente) setResultados(lista);
    });

    return () => {
      vigente = false;
    };
  }, [fuentes]);

  if (!resultados) return <p>Cargando…</p>;

  return (
    <ul>
      {resultados.map((resultado, i) => (
        <li key={fuentes[i].nombre}>
          {fuentes[i].nombre}: {resultado.status === "fulfilled" ? resultado.value : "no disponible"}
        </li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Con Ventas (sale bien) y Clima (lanza error), `allSettled` devuelve:

```js
[
  { status: "fulfilled", value: "S/ 540" },
  { status: "rejected", reason: Error("caído") },
]
```

| `i` | `fuentes[i].nombre` | `resultado.status` | Se pinta |
|---|---|---|---|
| 0 | `"Ventas"` | `"fulfilled"` | `Ventas: S/ 540` |
| 1 | `"Clima"` | `"rejected"` | `Clima: no disponible` |

Comparación con las otras funciones de promesas:

| Función | Se cumple cuando... | Se rechaza cuando... |
|---|---|---|
| `Promise.all` | todas se cumplen | **una** falla (pierdes todo) |
| `Promise.allSettled` | todas terminan, como sea | nunca |
| `Promise.race` | la primera termina | la primera termina con error |
| `Promise.any` | la primera se cumple | todas fallan |

El orden de los resultados es el de las promesas, **no** el orden en que terminaron: en el test, "A" tarda más que "B" y aun así sale primera.

## Errores comunes

- **Usar `Promise.all`.** Con Clima caído, el `.then` nunca se ejecuta y el tablero se queda en "Cargando…" (o en error total).
- **Buscar `resultado.value` sin mirar `status`.** En los rechazados, `value` es `undefined` y verías "Clima: " vacío.
- **Usar `resultado.ok` o `resultado.error`.** No existen: las propiedades son `status`, `value` y `reason`.
- **`await` dentro de un `forEach`** para cargar una por una. `forEach` no espera promesas y el orden de llegada se vuelve impredecible.
- **Crear el arreglo `fuentes` dentro del componente padre en cada render.** Como es dependencia del efecto, se volvería a cargar todo en cada render. Defínelo fuera o con `useMemo`.

## Otra forma de resolverlo

Capturando el error de cada promesa con `.catch` y usando `Promise.all`:

```jsx
Promise.all(
  fuentes.map((fuente) =>
    fuente
      .cargar()
      .then((valor) => ({ ok: true, valor }))
      .catch(() => ({ ok: false }))
  )
).then((lista) => {
  if (vigente) setResultados(lista);
});
// ...
{resultado.ok ? resultado.valor : "no disponible"}
```

**¿Cuándo conviene?** Es lo que se hacía antes de que existiera `allSettled` (ES2020). Hoy solo conviene si quieres darle tu propia forma al resultado (por ejemplo, guardar un mensaje de error personalizado por fuente). Para el caso general, `allSettled` es más corto y expresa mejor la intención.

## Cómo explicarlo en la entrevista

> "Cargo todas las fuentes a la vez y uso `Promise.allSettled` en vez de `Promise.all`, porque `all` se rechaza con el primer error y perdería las fuentes que sí respondieron. `allSettled` espera a todas y me da un objeto por cada una con `status`, `value` o `reason`, en el mismo orden que las fuentes. Al pintar, uso el índice para emparejar cada resultado con su fuente y muestro el valor o 'no disponible'. Así el tablero falla de forma parcial y elegante."

## Conceptos

- **`Promise.allSettled`**: espera todas las promesas sin rechazarse nunca.
- **`status`, `value`, `reason`**: el informe de cada promesa terminada.
- **`Promise.all` vs `allSettled`**: todo o nada vs informe completo.
- **`Promise.race` y `Promise.any`**: la primera en terminar o la primera en cumplirse.
- **Degradación elegante**: si una parte falla, el resto sigue funcionando.
- **Orden de los resultados**: igual al de las promesas, no al de llegada.
- **Bandera `vigente`** en la limpieza del efecto.
