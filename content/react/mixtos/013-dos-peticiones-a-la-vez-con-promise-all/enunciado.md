Un panel necesita dos datos que **no dependen entre sí**: el menú y las promociones. Crea el componente `Panel` que los pide **al mismo tiempo** y muestra un resumen cuando llegan los dos.

## Reglas

- Exporta `Panel({ obtenerMenu, obtenerPromos })`. Ambas son funciones asíncronas que devuelven un arreglo.
- Al montar, lanza las **dos** peticiones a la vez (no esperes a una para pedir la otra).
- Mientras cargan, muestra `<p>Cargando…</p>`.
- Cuando llegan las dos, muestra `<p>{n} pizzas y {m} promos</p>` (por ejemplo, `3 pizzas y 1 promos`).
- Si **cualquiera** falla, muestra `<p role="alert">No se pudo cargar el panel</p>`.
- Si el componente se desmonta antes de que lleguen los datos, no intentes actualizar el estado.

## Ejemplo

```jsx
<Panel
  obtenerMenu={async () => ["Margarita", "Pepperoni", "Hawaiana"]}
  obtenerPromos={async () => ["2x1 los martes"]}
/>
```

Primero se ve `Cargando…` y luego `3 pizzas y 1 promos`.

## Por qué importa

Si haces `await` uno tras otro, el tiempo total es la **suma** de los dos; con `Promise.all`, es el de la **más lenta**. En una entrevista te pueden preguntar exactamente eso: "¿cómo harías dos peticiones en paralelo en un `useEffect`?". También verás la bandera `vigente`, la forma clásica de no actualizar un componente que ya se desmontó.
