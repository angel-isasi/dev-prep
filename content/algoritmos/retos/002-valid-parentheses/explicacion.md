## Idea clave

El último paréntesis que abriste es el primero que debes cerrar. Esa regla, "último en entrar, primero en salir", es exactamente lo que hace una **pila**. Apilas cada apertura y, cuando llega un cierre, sacas el tope y verificas que sea su pareja.

## Paso a paso

1. **Descarta la idea de contar.** Contar cuántos `(` y `)` hay no basta: `"([)]"` tiene uno de cada tipo y aun así está mal, porque se cierran cruzados. Importa el **orden**, no solo la cantidad.
2. **La solución directa** (dila en voz alta): borrar pares vacíos `()`, `[]` o `{}` una y otra vez hasta que no quede ninguno. Si la cadena termina vacía, era válida. Funciona, pero cada `replace` recorre la cadena y puedes necesitar hasta n/2 rondas: O(n²).

   ```js
   let anterior;
   while (s !== anterior) {
     anterior = s;
     s = s.replace("()", "").replace("[]", "").replace("{}", "");
   }
   return s === "";
   ```

3. **Mejora con una pila.** Recorre la cadena una vez. Si el carácter es de apertura, haz `push`. Si es de cierre, haz `pop` y compara: lo que sacaste tiene que ser la apertura de ese cierre.
4. **Un diccionario de pares** evita una cadena de `if`: `pares[")"]` vale `"("`. Además, `c in pares` te dice si `c` es un cierre.
5. **Al final revisa la pila.** Si quedó algo, hubo aperturas sin cerrar (`"(("`).
6. **El cierre sin apertura se maneja solo**: si la pila está vacía, `pop()` devuelve `undefined`, que nunca es igual a `"("`, así que devuelves `false`.

```js
export function esValido(s) {
  const pares = { ")": "(", "]": "[", "}": "{" };
  const pila = [];

  for (const c of s) {
    if (c in pares) {
      if (pila.pop() !== pares[c]) return false;
    } else {
      pila.push(c);
    }
  }

  return pila.length === 0;
}
```

## Por qué funciona

Recorrido con `esValido("{[()]}")`:

| `c` | ¿Es cierre? | Acción | `pila` después |
|---|---|---|---|
| `{` | no | `push("{")` | `["{"]` |
| `[` | no | `push("[")` | `["{", "["]` |
| `(` | no | `push("(")` | `["{", "[", "("]` |
| `)` | sí | `pop()` da `"("`, igual a `pares[")"]` | `["{", "["]` |
| `]` | sí | `pop()` da `"["`, igual a `pares["]"]` | `["{"]` |
| `}` | sí | `pop()` da `"{"`, igual a `pares["}"]` | `[]` |

Termina con la pila vacía: devuelve `true`.

Ahora `esValido("([)]")`: después de `(` y `[` la pila es `["(", "["]`. Llega `)`, haces `pop()` y sale `"["`, pero `pares[")"]` es `"("`. No coinciden: devuelve `false` en ese mismo momento, sin mirar el resto.

## Errores comunes

- **Contar en vez de apilar.** Con contadores, `"([)]"` da `true`. Lo reconoces porque falla el test de los cruzados y pasan casi todos los demás.
- **Olvidar revisar la pila al final** y devolver `true` directamente. `"(("` nunca entra al `if` de cierre, así que devolverías `true`. Falla el test de "quedan abiertos".
- **Usar `shift()` en vez de `pop()`.** `shift` saca el **primero** que entró (eso es una cola, no una pila). `"([])"` fallaría porque comparas `]` con `(`.
- **Comparar el cierre con la apertura directamente** (`pila.pop() !== c`). Un `)` nunca es igual a `(`; necesitas el diccionario `pares` para traducir.
- **Mirar el tope con `pila[pila.length - 1]` y olvidar sacarlo.** La pila nunca se vacía y todo da `false`.

## Otra forma de resolverlo

La de **reemplazos repetidos** del paso 2. Ventaja: se entiende de inmediato y es corta. Desventajas: O(n²) de tiempo, y crea una cadena nueva en cada `replace`.

También puedes escribir la pila con un `switch` o con `if` para cada tipo en lugar del objeto `pares`. Es igual de eficiente, solo más largo:

```js
if (c === "(" || c === "[" || c === "{") pila.push(c);
else if (c === ")" && pila.pop() !== "(") return false;
// ... un else if por cada tipo de cierre
```

**¿Cuál conviene?** La pila: O(n) de tiempo y es la respuesta que el entrevistador espera. Este problema es la forma típica de comprobar si reconoces cuándo usar una pila.

## Cómo explicarlo en la entrevista

> "Esto es un caso clásico de pila, porque el último paréntesis que abro es el primero que debo cerrar. Recorro la cadena una vez: si es una apertura, la apilo; si es un cierre, saco el tope y verifico que sea su pareja usando un objeto que relaciona cada cierre con su apertura. Si no coincide, o la pila estaba vacía, devuelvo false. Al final la pila tiene que quedar vacía, porque si sobra algo es que quedó un paréntesis abierto. Es O(n) de tiempo y O(n) de memoria en el peor caso, cuando todo son aperturas."

## Conceptos

- **Pila (LIFO)**: último en entrar, primero en salir. En JavaScript, un arreglo con `push` y `pop`.
- **Cola (FIFO)**: primero en entrar, primero en salir (`push` y `shift`). Aquí sería un error.
- **Operador `in`**: `"x" in obj` dice si el objeto tiene esa clave.
- **Objeto como diccionario**: traduce un valor a otro sin cadenas de `if`.
- **Salida temprana**: devolver `false` apenas encuentras un error, sin recorrer el resto.
