## Idea clave

Calcula la diferencia en segundos **con signo**, busca la unidad más grande que quepa y deja que `Intl.RelativeTimeFormat` escriba el texto en español ("hace", "dentro de", "ayer"). La función recibe `ahora` como parámetro para ser **pura y fácil de probar**.

## Paso a paso

1. **Crea el formateador una vez**, fuera de la función: `new Intl.RelativeTimeFormat("es", { numeric: "auto" })`. Con `numeric: "auto"`, `-1 day` se escribe "ayer" y `2 day` "pasado mañana".
2. **Diferencia en segundos**: `(new Date(fecha).getTime() - ahora) / 1000`. Si la fecha ya pasó, el resultado es **negativo**, y eso es justo lo que `Intl` necesita para escribir "hace".
3. **Elige la unidad**: recorre las unidades de mayor a menor. En la primera donde `Math.abs(segundos) >= tamano`, conviertes (`segundos / tamano`), redondeas y formateas.
4. **Caso chico**: si ninguna unidad cabe (menos de 60 segundos), devuelves `"ahora mismo"`.
5. **El componente** solo llama a la función y la pone dentro de `<time dateTime={fecha}>`, la etiqueta semántica para fechas.

```jsx
const formato = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const UNIDADES = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function haceCuanto(fecha, ahora = Date.now()) {
  const segundos = Math.round((new Date(fecha).getTime() - ahora) / 1000);

  for (const [unidad, tamano] of UNIDADES) {
    if (Math.abs(segundos) >= tamano) {
      return formato.format(Math.round(segundos / tamano), unidad);
    }
  }
  return "ahora mismo";
}

export function Publicado({ fecha, ahora }) {
  return <time dateTime={fecha}>{haceCuanto(fecha, ahora)}</time>;
}
```

## Por qué funciona

Con `ahora` = 12 de noviembre, 12:00:

| Fecha | `segundos` | Primera unidad que cabe | `format(...)` |
|---|---|---|---|
| 9 nov 12:00 | `-259200` | day (86400) | `format(-3, "day")` = "hace 3 días" |
| 11 nov 12:00 | `-86400` | day | `format(-1, "day")` = "ayer" |
| 12 nov 10:00 | `-7200` | hour (3600) | `format(-2, "hour")` = "hace 2 horas" |
| 12 nov 11:55 | `-300` | minute (60) | `format(-5, "minute")` = "hace 5 minutos" |
| 12 nov 11:59:40 | `-20` | ninguna | "ahora mismo" |
| 15 nov 12:00 | `259200` | day | `format(3, "day")` = "dentro de 3 días" |

Se usa `Math.abs` para comparar el **tamaño** de la diferencia sin importar si es pasado o futuro; el signo se conserva para `format`.

¿Por qué recibir `ahora`? Si la función llamara a `Date.now()` adentro, el resultado cambiaría cada vez que corres el test. Con `ahora` fijo, "hace 3 días" siempre es "hace 3 días". El valor por defecto `= Date.now()` hace que en la app real no tengas que pasarlo.

## Errores comunes

- **Olvidar el signo.** Si haces `ahora - fecha` (al revés), las fechas pasadas salen como "dentro de 3 días".
- **Comparar sin `Math.abs`.** Con un número negativo, `-259200 >= 86400` es `false` y todo cae en "ahora mismo".
- **Crear el `Intl.RelativeTimeFormat` dentro de la función o del componente.** Funciona, pero lo construyes en cada llamada o cada render, y es lento.
- **Armar el texto a mano** (`"hace " + n + " días"`). Te sale "hace 1 días", no sabes decir "ayer" y no sirve para otros idiomas.
- **Llamar a `Date.now()` dentro sin dejar inyectarlo.** Los tests se vuelven frágiles: pasan hoy y fallan mañana.

## Otra forma de resolverlo

Con un `if` por unidad, más explícito para quien recién empieza:

```jsx
export function haceCuanto(fecha, ahora = Date.now()) {
  const segundos = Math.round((new Date(fecha).getTime() - ahora) / 1000);
  const abs = Math.abs(segundos);
  if (abs >= 86400) return formato.format(Math.round(segundos / 86400), "day");
  if (abs >= 3600) return formato.format(Math.round(segundos / 3600), "hour");
  if (abs >= 60) return formato.format(Math.round(segundos / 60), "minute");
  return "ahora mismo";
}
```

**¿Cuándo conviene?** Con tres unidades es igual de legible. La versión con la lista `UNIDADES` escala mejor: para agregar semanas o meses solo sumas una fila (`["week", 604800]`) sin tocar la lógica.

En una app real, para que "hace 2 minutos" se actualice solo, el componente tendría un `setInterval` que actualice `ahora` en un estado cada minuto.

## Cómo explicarlo en la entrevista

> "Separé la lógica en una función pura `haceCuanto` que recibe la fecha y el momento actual. Calculo la diferencia en segundos con signo, recorro las unidades de mayor a menor y uso la primera que cabe. El texto lo genera `Intl.RelativeTimeFormat` con `numeric: 'auto'`, así obtengo 'ayer' o 'dentro de 3 días' sin armar strings a mano. Recibir `ahora` como parámetro hace la función determinista: la puedo probar con una fecha fija. El componente solo la llama y usa `<time dateTime>` por semántica."

## Conceptos

- **`Intl.RelativeTimeFormat`**: formatea tiempos relativos ("hace 2 horas") según el idioma.
- **`numeric: "auto"`**: usa palabras como "ayer" o "mañana" cuando existen.
- **`Date.parse` / `getTime()`**: convierten una fecha a milisegundos desde 1970.
- **Función pura**: mismo resultado para los mismos argumentos, sin depender del reloj.
- **Inyección de dependencias**: pasar `ahora` como parámetro en lugar de leerlo adentro.
- **Parámetro por defecto**: `ahora = Date.now()` se usa solo si no lo pasan.
- **`<time dateTime>`**: etiqueta semántica que guarda la fecha exacta para máquinas.
