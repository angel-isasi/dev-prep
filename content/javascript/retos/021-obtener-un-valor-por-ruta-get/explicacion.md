## Idea clave

**Normalizas la ruta** a una lista de claves y **bajas nivel por nivel**. Antes de cada paso compruebas que todavía haya un objeto donde bajar; si encuentras `null` o `undefined`, devuelves el valor por defecto en lugar de romper.

## Paso a paso

1. **Normaliza los corchetes**: `ruta.replace(/\[(\d+)\]/g, ".$1")` convierte `"a.b[0].c"` en `"a.b.0.c"`.
2. **Corta por puntos**: `split(".")` da `["a", "b", "0", "c"]`.
3. **Empieza en `actual = obj`** y recorre las partes.
4. **En cada paso**, si `actual == null`, devuelve `porDefecto`. Si no, baja: `actual = actual[parte]`. Los arreglos aceptan índices en texto: `arr["0"]` es lo mismo que `arr[0]`.
5. **Al final**, si `actual` es `undefined`, devuelve `porDefecto`; si no, devuelve `actual`, aunque sea `0`, `""`, `false` o `null`.

```js
export function obtener(obj, ruta, porDefecto) {
  const partes = ruta.replace(/\[(\d+)\]/g, ".$1").split(".");

  let actual = obj;
  for (const parte of partes) {
    if (actual == null) return porDefecto;
    actual = actual[parte];
  }

  return actual === undefined ? porDefecto : actual;
}
```

## Por qué funciona

La expresión regular `/\[(\d+)\]/g` se lee así: `\[` es un corchete de apertura literal, `(\d+)` captura uno o más dígitos, `\]` es el corchete de cierre, y `g` reemplaza **todas** las apariciones. En el reemplazo, `$1` es lo que capturaron los paréntesis. Así `[0]` se vuelve `.0`.

Recorrido con `obtener({ a: { b: [{ c: 5 }] } }, "a.b[0].c")`:

| Paso | `parte` | `actual` antes | `actual` después |
|---|---|---|---|
| 1 | `"a"` | el objeto completo | `{ b: [...] }` |
| 2 | `"b"` | `{ b: [...] }` | `[{ c: 5 }]` |
| 3 | `"0"` | `[{ c: 5 }]` | `{ c: 5 }` |
| 4 | `"c"` | `{ c: 5 }` | `5` |

Y con `"a.x.y"`: en el paso 2, `actual["x"]` es `undefined`. En el paso 3, `actual == null` es verdadero y se devuelve `"nada"` antes de intentar `undefined["y"]`, que habría lanzado un error.

`actual == null` (con dos signos de igual) es un atajo que da `true` para `null` **y** para `undefined`, y para nada más.

## Errores comunes

- **Usar `||` para el valor por defecto: `return actual || porDefecto`.** Con `stock: 0` devuelves 10. Lo reconoces porque falla el test de los falsy.
- **No revisar `null` antes de bajar.** `actual[parte]` sobre `undefined` lanza "Cannot read properties of undefined". Lo reconoces porque el test de "no existe" falla con ese error.
- **Revisar con `if (!actual)` en el bucle.** Un `0` o un `""` en medio del camino cortaría la búsqueda por error.
- **Olvidar el `g` de la expresión regular.** Solo se reemplaza el primer corchete: `"m[1][0]"` queda `"m.1[0]"`. Lo reconoces porque ese caso devuelve `undefined`.
- **Cortar por puntos sin normalizar los corchetes.** Buscas una propiedad llamada `"b[0]"`, que no existe.

## Otra forma de resolverlo

Con `reduce` y optional chaining:

```js
export function obtener(obj, ruta, porDefecto) {
  const valor = ruta
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((actual, parte) => actual?.[parte], obj);

  return valor === undefined ? porDefecto : valor;
}
```

`actual?.[parte]` devuelve `undefined` si `actual` es `null` o `undefined`, en vez de lanzar un error, y ese `undefined` se arrastra hasta el final. Es más corto. La diferencia: no corta en cuanto encuentra el hueco, sigue "recorriendo" con `undefined` hasta terminar las partes (irrelevante en la práctica).

Cuando la ruta la conoces al escribir el código, ni siquiera necesitas esta función: `datos.a?.b?.[0]?.c ?? "nada"` hace lo mismo. `obtener` sirve cuando la ruta llega como **texto**, por ejemplo desde una configuración.

## Cómo explicarlo en la entrevista

> "Normalizo la ruta con una expresión regular para aceptar corchetes, la parto por puntos y voy bajando nivel por nivel. Antes de cada paso reviso si el valor actual es `null` o `undefined`; si lo es, devuelvo el valor por defecto en vez de romper. Al final solo uso el valor por defecto si el resultado es `undefined`, para no perder valores como `0` o `false`. Es O(k) en la cantidad de partes de la ruta. Hace lo mismo que el optional chaining `?.`, pero con la ruta como texto."

## Conceptos

- **Expresión regular con captura**: `( )` guarda una parte del texto que luego usas como `$1` en `replace`.
- **Bandera `g`**: hace que `replace` actúe sobre todas las coincidencias.
- **`x == null`**: verdadero solo para `null` y `undefined`.
- **Optional chaining `?.`**: lee una propiedad o devuelve `undefined` si lo de la izquierda es `null` o `undefined`.
- **`??` vs `||`**: `??` solo reemplaza `null`/`undefined`; `||` reemplaza cualquier falsy.
- **Claves en texto**: `arr["0"]` y `arr[0]` son lo mismo; las claves de objetos son textos.
