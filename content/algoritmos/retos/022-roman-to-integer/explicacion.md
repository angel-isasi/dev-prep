## Idea clave

Cada símbolo **se suma**, salvo que vaya justo antes de uno **mayor**: entonces **se resta**. Recorres comparando cada símbolo con el siguiente y decides sumar o restar. Una sola pasada.

## Paso a paso

1. **La solución directa** (dila en voz alta): una tabla con los seis pares especiales (`IV`, `IX`, `XL`, `XC`, `CD`, `CM`). En cada posición miras primero si los dos caracteres siguientes forman un par especial; si sí, sumas su valor y avanzas 2; si no, sumas el símbolo solo y avanzas 1. Funciona y es O(n), pero necesitas dos tablas y lógica de avance variable.

   ```js
   const especiales = { IV: 4, IX: 9, XL: 40, XC: 90, CD: 400, CM: 900 };
   let total = 0;
   let i = 0;
   while (i < s.length) {
     const par = s.slice(i, i + 2);
     if (par in especiales) { total += especiales[par]; i += 2; }
     else { total += VALORES[s[i]]; i += 1; }
   }
   return total;
   ```

2. **Encuentra la regla general.** En los seis casos especiales, el símbolo de la izquierda es **menor** que el de la derecha. Y en todo número romano válido, eso solo pasa en esos casos. Entonces no hace falta listarlos: basta comparar con el siguiente.
3. **Guarda los valores** en un objeto `VALORES` para traducir cada letra a su número.
4. **Recorre con índice** (necesitas mirar `s[i + 1]`). Si `actual < siguiente`, resta `actual`; si no, súmalo.
5. **El último símbolo no tiene siguiente**: `s[s.length]` es `undefined`, `VALORES[undefined]` también, y el `|| 0` lo convierte en 0. Así el último siempre se suma.

```js
const VALORES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

export function romanoAEntero(s) {
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const actual = VALORES[s[i]];
    const siguiente = VALORES[s[i + 1]] || 0;
    if (actual < siguiente) total -= actual;
    else total += actual;
  }
  return total;
}
```

## Por qué funciona

Recorrido con `romanoAEntero("MCMXCIV")`:

| `i` | Símbolo | `actual` | `siguiente` | ¿Menor? | Operación | `total` |
|---|---|---|---|---|---|---|
| 0 | M | 1000 | 100 (C) | no | +1000 | 1000 |
| 1 | C | 100 | 1000 (M) | **sí** | -100 | 900 |
| 2 | M | 1000 | 10 (X) | no | +1000 | 1900 |
| 3 | X | 10 | 100 (C) | **sí** | -10 | 1890 |
| 4 | C | 100 | 1 (I) | no | +100 | 1990 |
| 5 | I | 1 | 5 (V) | **sí** | -1 | 1989 |
| 6 | V | 5 | 0 (no hay) | no | +5 | **1994** |

Fíjate que `CM` no se calcula como "900 de golpe", sino como -100 y luego +1000. El resultado es el mismo: 1000 - 100 = 900.

## Errores comunes

- **Comparar con `<=` en vez de `<`.** Dos símbolos iguales seguidos se restarían: `"II"` daría -1 + 1 = 0. Lo reconoces en el test `III`.
- **Comparar con el anterior en lugar del siguiente** sin ajustar la lógica. Si recorres de izquierda a derecha y miras hacia atrás, cuando descubres la resta el símbolo menor ya se sumó: hay que restarlo **dos veces** (una para deshacer y otra para restar).
- **Olvidar el caso del último símbolo.** Sin el `|| 0`, `actual < undefined` es `false` y por casualidad funciona, pero es frágil y difícil de leer. Hazlo explícito.
- **Recorrer con `for...of`.** No tienes el índice para mirar el siguiente carácter. Usa un `for` clásico.
- **Escribir las seis restas con `replace`** (`s.replace("IV", "IIII")...`). Funciona, pero es fácil olvidar un caso y el código crece sin necesidad.

## Otra forma de resolverlo

**Tabla de pares especiales** (paso 1): O(n) de tiempo. Es la que haría alguien que recuerda las reglas del colegio. Más larga y con más lugares para equivocarse.

**Recorrer de derecha a izquierda**: llevas el valor del símbolo anterior (el de la derecha). Si el actual es menor que ese, restas; si no, sumas. Es la misma idea vista al revés y evita el `|| 0`:

```js
let total = 0;
let anterior = 0;
for (let i = s.length - 1; i >= 0; i--) {
  const actual = VALORES[s[i]];
  total += actual < anterior ? -actual : actual;
  anterior = actual;
}
return total;
```

**¿Cuál conviene?** La de comparar con el siguiente: O(n) de tiempo, O(1) de memoria, y se explica con una sola regla.

## Cómo explicarlo en la entrevista

> "Normalmente los símbolos romanos se suman, pero si uno es menor que el que le sigue, como en IV o CM, se resta. En vez de listar los seis casos especiales, recorro la cadena una vez y comparo cada símbolo con el siguiente: si es menor, lo resto; si no, lo sumo. El último siempre se suma porque no tiene siguiente. Es O(n) de tiempo y O(1) de memoria, porque la tabla de valores tiene tamaño fijo."

## Conceptos

- **Objeto como tabla de traducción**: `VALORES[letra]` convierte un símbolo en su número.
- **Mirar el siguiente elemento**: `s[i + 1]`, con cuidado en el último índice.
- **`|| 0` como valor por defecto**: reemplaza `undefined` por 0.
- **Generalizar casos especiales**: encontrar una regla que cubra todos en lugar de listarlos.
- **Constantes fuera de la función**: `VALORES` se crea una sola vez, no en cada llamada.
