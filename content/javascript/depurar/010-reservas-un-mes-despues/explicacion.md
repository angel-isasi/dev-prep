## Idea clave

En `Date`, los **meses van de 0 a 11** (enero es `0`), mientras que los días van de 1 a 31. El usuario escribe el mes como lo dice una persona (marzo es `3`), y el código se lo pasaba tal cual a `new Date`, que lo interpretaba como abril. Hay que restar 1.

## Paso a paso

1. **Lee el síntoma.** Siempre se corre exactamente un mes hacia adelante. Un error constante de "uno" suele ser un problema de contar desde 0 o desde 1.
2. **Explica el caso raro.** "31/01 se convierte en 3 de marzo" parece otro bug, pero es el mismo: el código crea el "31 de febrero", que no existe, y `Date` lo desborda: 28 días de febrero de 2026 más 3 días, 3 de marzo.
3. **Aísla.** En la consola: `new Date(2026, 3, 15)` muestra abril. `new Date(2026, 2, 15)` muestra marzo.
4. **Resta 1 al mes.**

```js
return new Date(anio, mes - 1, dia);
```

## Por qué funciona

| Texto | `mes` leído | Lo que recibe `Date` | Resultado |
|---|---|---|---|
| `"15/03/2026"` | `3` | `3 - 1 = 2` | 15 de marzo |
| `"31/01/2026"` | `1` | `0` | 31 de enero |
| `"01/12/2025"` | `12` | `11` | 1 de diciembre de 2025 |

Sin el `- 1`, diciembre (`12`) se desborda a enero **del año siguiente**, porque el mes `12` no existe.

Esta regla de "contar desde 0" también afecta al leer: `fecha.getMonth()` de una fecha de marzo devuelve `2`. Por eso, para mostrarla, sumas 1. `getDate()` (el día) sí empieza en 1, y `getDay()` es el día de la **semana** (0 es domingo).

## Errores comunes

- **Usar `new Date("2026-03-15")` (texto ISO).** Ese formato se interpreta en **UTC**, así que en Perú (UTC-5) la fecha queda el 14 a las 7 de la noche. Las pruebas de "mismo día" fallan según la zona horaria.
- **Restar 1 al mostrar en vez de al crear.** El correo saldría bien, pero el `Date` guardado seguiría en abril, y cualquier cálculo (días que faltan, ordenar reservas) estaría mal.
- **Corregir solo enero** con un `if`. El error afecta a todos los meses.

## Otra forma de resolverlo

Construir un texto ISO **sin la Z** y con hora, que se interpreta en hora local:

```js
export function leerFecha(texto) {
  const [dia, mes, anio] = texto.split("/");
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
```

Funciona, pero es más frágil (los días y meses deben venir con dos dígitos). Con números, `new Date(anio, mes - 1, dia)` es lo más claro. En proyectos grandes se usan librerías como date-fns o Day.js para no tropezar con estas reglas.

## Cómo explicarlo en la entrevista

> "Las fechas salían siempre un mes después. En `Date` los meses empiezan en 0, así que al pasar el 3 de marzo se creaba abril. El caso del 31 de enero que terminaba en marzo era lo mismo más el desborde: el 31 de febrero no existe y `Date` lo pasa al mes siguiente. Lo arreglé restando 1 al mes al construir la fecha. También evito `new Date('2026-03-15')` porque se lee en UTC."

## Conceptos

- **`new Date(anio, mes, dia)`**: crea una fecha en hora local; `mes` va de 0 a 11.
- **Desborde**: si un valor se pasa del rango (día 31 en febrero), `Date` lo traslada al mes siguiente.
- **`getMonth()`**: devuelve el mes de 0 a 11; `getDate()` el día de 1 a 31; `getDay()` el día de la semana.
- **UTC y hora local**: una fecha ISO solo con día se lee en UTC; con constructor de números, en hora local.
- **Desestructuración de arreglos**: `const [dia, mes, anio] = arr` saca los elementos por posición.
