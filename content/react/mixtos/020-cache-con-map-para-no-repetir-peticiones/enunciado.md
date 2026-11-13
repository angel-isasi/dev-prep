El usuario navega entre pizzas: ve la 1, luego la 2, y vuelve a la 1. No tiene sentido volver a pedir la 1 al servidor: ya la tenemos. Vas a crear una **caché** con `Map` que recuerde las peticiones.

Exporta:

- `obtenerConCache(clave, cargar)`: si la `clave` no está en la caché, llama a `cargar(clave)` y guarda **la promesa** que devuelve. Siempre devuelve la promesa guardada para esa clave.
- `Detalle({ id, cargar })`: componente que muestra el detalle de una pizza usando `obtenerConCache`.

## Reglas

- La caché es un `Map` creado **fuera** del componente (a nivel de módulo), para que sobreviva entre renders y entre componentes.
- `obtenerConCache` guarda la **promesa**, no el resultado: si dos componentes piden la misma clave al mismo tiempo, comparten **una sola** petición.
- `Detalle` muestra un `<p>`: `Cargando…` mientras espera y el texto que devolvió `cargar` cuando llega.
- Si cambia el `id`, vuelve a mostrar `Cargando…` y luego el dato nuevo.
- Si el `id` cambia antes de que llegue la respuesta anterior, esa respuesta vieja se ignora.

## Ejemplo

```jsx
const cargar = async (id) => `Pizza ${id}`;

<Detalle id={1} cargar={cargar} />  // Cargando… -> Pizza 1   (cargar llamado 1 vez)
<Detalle id={2} cargar={cargar} />  // Cargando… -> Pizza 2   (cargar llamado 2 veces)
<Detalle id={1} cargar={cargar} />  // Pizza 1                (sigue en 2: vino de la caché)
```

## Por qué importa

Cachear peticiones es lo que hacen por dentro librerías como TanStack Query o SWR. El ejercicio junta un **closure de módulo** (el `Map` vive mientras la app esté abierta), la diferencia entre **guardar una promesa o un valor** y el patrón de `useEffect` para cargar datos con limpieza.
