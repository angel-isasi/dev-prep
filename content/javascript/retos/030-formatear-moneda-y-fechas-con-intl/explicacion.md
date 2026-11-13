## Idea clave

`Intl` ya conoce las reglas de cada país: separadores, símbolo de moneda, nombres de los meses. Creas un **formateador** con el locale `"es-PE"` y las opciones, y llamas a su `format`. Para las fechas, la opción `timeZone: "America/Lima"` hace que el día no cambie según dónde esté la computadora.

## Paso a paso

1. **Crea el formateador de soles** con `new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" })`. El estilo `"currency"` agrega el símbolo y fija 2 decimales, porque el sol tiene céntimos.
2. **Crea el formateador de fechas** con `new Intl.DateTimeFormat("es-PE", {...})` y las opciones `day: "numeric"` (sin cero adelante), `month: "long"` (nombre completo), `year: "numeric"` y `timeZone: "America/Lima"`.
3. Créalos **una sola vez**, fuera de las funciones: crear un formateador es más costoso que usarlo.
4. **`soles(monto)`** devuelve `formatoSoles.format(monto)`.
5. **`fechaLarga(iso)`** convierte el texto con `new Date(iso)` y devuelve `formatoFecha.format(...)`.

```js
const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

const formatoFecha = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Lima",
});

export function soles(monto) {
  return formatoSoles.format(monto);
}

export function fechaLarga(iso) {
  return formatoFecha.format(new Date(iso));
}
```

## Por qué funciona

Un objeto `Date` guarda **un instante**, no un día: los milisegundos desde 1970 en UTC. Qué día es ese instante depende de dónde lo mires. Eso es lo que decide `timeZone`.

| Texto ISO | Instante en UTC | En Lima (UTC-5) | `fechaLarga` |
|---|---|---|---|
| `2026-11-17T12:00:00-05:00` | 17 nov, 17:00 | 17 nov, 12:00 | 17 de noviembre de 2026 |
| `2026-11-18T03:00:00Z` | 18 nov, 03:00 | 17 nov, 22:00 | 17 de noviembre de 2026 |
| `2027-01-01T04:59:00Z` | 1 ene, 04:59 | 31 dic, 23:59 | 31 de diciembre de 2026 |

Sin `timeZone`, `Intl` usa la zona de la computadora donde corre el código: en un servidor en Europa, el segundo ejemplo saldría "18 de noviembre".

Para el dinero, `"es-PE"` define coma para los miles y punto para los decimales, y `"PEN"` define el símbolo `S/`. `Intl` mete un espacio "duro" (que no se parte al final de una línea) entre el símbolo y el número, por eso los tests aceptan cualquier espacio.

## Errores comunes

- **Armar el texto a mano: `` `S/ ${monto.toFixed(2)}` ``.** Te faltan las comas de los miles: `"S/ 1234.50"`. Lo reconoces porque el primer test lo rechaza.
- **Olvidar `timeZone`.** Funciona en tu laptop en Perú y falla en otra zona horaria (por ejemplo, en un servidor o en la máquina de un compañero). Lo reconoces porque el test de "la hora de Lima" da el día siguiente.
- **Leer el día con `getDate()`.** Usa la zona de la computadora, mismo problema que el anterior.
- **Usar `month: "2-digit"` o `"short"`.** Sale `"17/11/2026"` o `"17 nov 2026"`.
- **Comparar con `toBe("S/ 1,234.50")` escribiendo un espacio normal.** Falla por el espacio duro aunque se vea igual. No es un error de tu función, pero confunde la primera vez.

## Otra forma de resolverlo

Con `toLocaleString` y `toLocaleDateString`, atajos que usan `Intl` por dentro:

```js
export function soles(monto) {
  return monto.toLocaleString("es-PE", { style: "currency", currency: "PEN" });
}

export function fechaLarga(iso) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });
}
```

Dan el mismo resultado y son cómodos para un uso suelto. Conviene la versión con formateadores reutilizados cuando formateas muchos valores (por ejemplo, los precios de una lista de 500 productos), porque `toLocaleString` crea un formateador nuevo en cada llamada.

## Cómo explicarlo en la entrevista

> "En lugar de armar formatos a mano, uso `Intl`, que ya conoce las reglas de cada país: separadores, símbolo de moneda y nombres de meses. Para el dinero, un `NumberFormat` con locale `es-PE`, estilo `currency` y moneda `PEN`. Para la fecha, un `DateTimeFormat` con día, mes largo y año, y la zona horaria `America/Lima`, para que una fecha no cambie de día según dónde esté el usuario o el servidor. Creo los formateadores una vez y los reutilizo."

## Conceptos

- **`Intl`**: API de internacionalización: números, monedas, fechas, plurales, listas.
- **Locale**: código de idioma y país, como `"es-PE"` o `"en-US"`; define las reglas de formato.
- **`Intl.NumberFormat`**: formatea números; con `style: "currency"` y `currency: "PEN"` muestra soles.
- **`Intl.DateTimeFormat`**: formatea fechas; las opciones eligen qué partes mostrar y cómo.
- **Zona horaria (`timeZone`)**: un mismo instante cae en días distintos según la zona; `"America/Lima"` es UTC-5.
- **Formato ISO 8601**: `"2026-11-17T12:00:00-05:00"`; la `Z` final significa UTC.
- **`Date`**: guarda un instante (milisegundos desde 1970 en UTC), no un día del calendario.
