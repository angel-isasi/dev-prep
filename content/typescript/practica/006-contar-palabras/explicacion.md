## Idea clave

Cuando las claves de un objeto **no se conocen de antemano** (las palabras dependen del texto), no puedes escribir una interface con propiedades fijas. Usas `Record<string, number>`: "un objeto con claves de texto y valores numéricos". Con eso, el conteo es un diccionario que llenas con `conteo[palabra] = (conteo[palabra] ?? 0) + 1`.

## Paso a paso

1. **Elige el tipo.** Una interface como `{ hola: number; mundo: number }` no sirve: mañana el texto trae "barato". `Record<string, number>` acepta cualquier clave de texto, y todas tienen valor `number`.
2. **Limpia el texto en cadena.**
   - `toLowerCase()` para que "Muy" y "muy" sean la misma palabra.
   - `replace(/[.,;:!?¡¿]/g, "")` quita los signos. El `g` es para quitarlos todos, no solo el primero.
   - `split(/\s+/)` corta por uno o más espacios, tabs o saltos de línea.
   - `filter((p) => p !== "")` quita los vacíos: `"  hola".split(/\s+/)` da `["", "hola"]`.
3. **Cuenta.** Si la palabra todavía no está, `conteo[palabra]` es `undefined`; `?? 0` lo convierte en 0 y le sumas 1.
4. **La más frecuente.** Recorres `Object.entries(conteo)`, que da pares `[palabra, veces]`, y te quedas con la de mayor `veces`. Empiezas con `mejor = null`, así un objeto vacío devuelve `null` sin caso especial.

```ts
export function contarPalabras(texto: string): Record<string, number> {
  const conteo: Record<string, number> = {};
  const palabras = texto
    .toLowerCase()
    .replace(/[.,;:!?¡¿]/g, "")
    .split(/\s+/)
    .filter((p) => p !== "");
  for (const palabra of palabras) {
    conteo[palabra] = (conteo[palabra] ?? 0) + 1;
  }
  return conteo;
}
```

## Por qué funciona

Recorrido con `"Muy bueno. ¡Muy rápido!   Bueno"`:

| Paso | Resultado |
|---|---|
| `toLowerCase()` | `"muy bueno. ¡muy rápido!   bueno"` |
| `replace(...)` | `"muy bueno muy rápido   bueno"` |
| `split(/\s+/)` | `["muy", "bueno", "muy", "rápido", "bueno"]` |

| Palabra | `conteo[palabra]` antes | Después |
|---|---|---|
| `muy` | `undefined` | `1` |
| `bueno` | `undefined` | `1` |
| `muy` | `1` | `2` |
| `rápido` | `undefined` | `1` |
| `bueno` | `1` | `2` |

Resultado: `{ muy: 2, bueno: 2, rápido: 1 }`. Y `masFrecuente` de eso: `muy` pone el máximo en 2; `bueno` también tiene 2, pero `2 > 2` es falso, así que se queda `muy`.

Un detalle de tipos: con `Record<string, number>`, TypeScript dice que `conteo["cualquiercosa"]` es `number`, aunque en realidad pueda ser `undefined`. Por eso usamos `?? 0` igual: el tipo no te protege de claves que no existen (la opción `noUncheckedIndexedAccess` del tsconfig lo cambiaría a `number | undefined`).

## Errores comunes

- **Usar `split(" ")`** en vez de `split(/\s+/)`. Con dos espacios seguidos aparecen palabras vacías `""` y con `\n` no corta.
- **Olvidar el `filter`.** Un texto que empieza con espacio deja un `""` al inicio y terminas con `{ "": 1 }`.
- **`conteo[palabra]++` sin inicializar.** `undefined + 1` da `NaN`.
- **Usar `>=` en `masFrecuente`.** En un empate te quedas con la última y no con la primera.
- **Tipar el conteo como `object` o `{}`.** Entonces `conteo[palabra]` da error ("la expresión de tipo string no se puede usar para indexar"). Hace falta la firma de índice o `Record`.
- **Olvidar el `g` en el `replace`.** Solo se quita el primer signo.

## Otra forma de resolverlo

**Con `reduce`** para el conteo:

```ts
return palabras.reduce<Record<string, number>>((acc, p) => {
  acc[p] = (acc[p] ?? 0) + 1;
  return acc;
}, {});
```

Fíjate en `reduce<Record<string, number>>`: sin ese tipo, TypeScript infiere el acumulador desde `{}` y no te deja agregarle claves.

**Con `Map<string, number>`**: `const conteo = new Map<string, number>(); conteo.set(p, (conteo.get(p) ?? 0) + 1);`. Un `Map` es mejor si las claves pueden chocar con propiedades heredadas (como `"constructor"`) o si necesitas el tamaño (`conteo.size`). El objeto `Record` es mejor si lo vas a mandar como JSON a una API o guardar en `localStorage`, porque un `Map` no se convierte a JSON directo.

## Cómo explicarlo en la entrevista

> "Como las claves dependen del texto, tipo el resultado como Record de string a number, que es un objeto con claves de texto y valores numéricos. Normalizo el texto: minúsculas, quito los signos con una expresión regular, separo por espacios con barra s más y filtro los vacíos. Luego cuento con conteo de palabra igual a lo que había o cero, más uno. Para la más frecuente recorro Object.entries guardando el máximo; uso mayor estricto para que en un empate gane la primera. Si necesitara claves más seguras usaría un Map."

## Conceptos

- **`Record<K, V>`**: objeto con claves de tipo `K` y valores de tipo `V`.
- **Firma de índice**: `{ [clave: string]: number }`, equivalente a `Record<string, number>`.
- **`Object.entries`**: convierte un objeto en un array de pares `[clave, valor]`.
- **Expresiones regulares**: `/[.,;:!?¡¿]/g` (un carácter de la lista, todas las veces) y `/\s+/` (uno o más espacios).
- **`??`**: valor por defecto solo para `null` o `undefined`.
- **Genérico en `reduce`**: `reduce<Tipo>(...)` para tipar el acumulador.
- **`Map` vs objeto**: `Map` para claves arbitrarias, objeto para JSON.
- Tema de Aprender: objetos e interfaces en TypeScript.
