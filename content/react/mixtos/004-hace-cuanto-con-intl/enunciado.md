Muchas apps muestran fechas relativas: "hace 2 horas", "ayer", "hace 3 días". Vas a construir eso con la API nativa `Intl.RelativeTimeFormat`, sin librerías.

Exporta:

- `haceCuanto(fecha, ahora = Date.now())`: recibe una fecha (texto ISO como `"2026-11-09T12:00:00Z"`) y el momento actual en milisegundos, y devuelve el texto relativo en español.
- `Publicado({ fecha, ahora })`: componente que pinta un `<time>` con `dateTime={fecha}` y el texto de `haceCuanto`.

## Reglas

- Usa `new Intl.RelativeTimeFormat("es", { numeric: "auto" })`. Con `numeric: "auto"` escribe "ayer" en vez de "hace 1 día".
- Elige la unidad más grande que quepa: si la diferencia es de 1 día o más, usa **días**; si no, **horas**; si no, **minutos**.
- Redondea la cantidad con `Math.round`.
- Si la diferencia es **menor a 1 minuto**, devuelve `"ahora mismo"`.
- Las fechas pasadas dan textos con "hace"; las futuras, con "dentro de" (eso lo hace `Intl` solo, según el signo).

## Ejemplo

```js
const ahora = Date.parse("2026-11-12T12:00:00Z");

haceCuanto("2026-11-09T12:00:00Z", ahora); // "hace 3 días"
haceCuanto("2026-11-11T12:00:00Z", ahora); // "ayer"
haceCuanto("2026-11-12T10:00:00Z", ahora); // "hace 2 horas"
haceCuanto("2026-11-12T11:59:40Z", ahora); // "ahora mismo"
haceCuanto("2026-11-15T12:00:00Z", ahora); // "dentro de 3 días"
```

```jsx
<Publicado fecha="2026-11-12T10:00:00Z" ahora={ahora} />
// <time datetime="2026-11-12T10:00:00Z">hace 2 horas</time>
```

## Por qué importa

Dos ideas que valen oro en entrevistas: **usar las APIs nativas** (`Intl`) en vez de armar textos a mano, y **recibir `ahora` como parámetro** en lugar de llamar a `Date.now()` adentro. Así la función es pura, predecible y se puede probar con una fecha fija; el componente solo la usa para pintar.
