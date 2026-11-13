## Idea clave

Cuentas cuántas veces tienes cada letra en la revista y luego vas **gastando** ese conteo al recorrer la nota. Si te piden una letra que ya no tienes, no se puede escribir. Es el patrón de conteo de Valid Anagram, pero aquí a la revista le pueden sobrar letras.

## Paso a paso

1. **La solución directa** (dila en voz alta): convertir la revista en un arreglo de letras y, por cada letra de la nota, buscarla con `indexOf` y borrarla con `splice` para no reutilizarla. Funciona, pero cada búsqueda y cada borrado recorren el arreglo: O(n · m).

   ```js
   const letras = [...revista];
   for (const letra of nota) {
     const pos = letras.indexOf(letra);
     if (pos === -1) return false;
     letras.splice(pos, 1);
   }
   return true;
   ```

2. **Cuenta en vez de buscar.** Recorre la revista una vez y guarda en un objeto cuántas veces aparece cada letra: `disponibles[letra] = (disponibles[letra] || 0) + 1`.
3. **Gasta con la nota.** Por cada letra de la nota, revisa si quedan (`disponibles[letra]` mayor que 0). Si no, devuelve `false`. Si sí, resta 1.
4. **`!disponibles[letra]` cubre dos casos a la vez**: la letra nunca estuvo (`undefined`) o ya se gastaron todas (`0`). Los dos son "falsy".
5. **Si terminas la nota sin problemas**, devuelve `true`. No importa si sobraron letras en la revista.

```js
export function puedeEscribir(nota, revista) {
  const disponibles = {};
  for (const letra of revista) {
    disponibles[letra] = (disponibles[letra] || 0) + 1;
  }

  for (const letra of nota) {
    if (!disponibles[letra]) return false;
    disponibles[letra]--;
  }

  return true;
}
```

## Por qué funciona

Recorrido con `puedeEscribir("aa", "ab")`. Después de contar la revista, `disponibles = { a: 1, b: 1 }`.

| Letra de la nota | `disponibles[letra]` antes | ¿Quedan? | `disponibles` después |
|---|---|---|---|
| `a` | 1 | sí | `{ a: 0, b: 1 }` |
| `a` | **0** | **no** | devuelve `false` |

Ahora `puedeEscribir("aa", "aab")`: `disponibles = { a: 2, b: 1 }`. La primera `a` lo baja a 1, la segunda a 0, y la nota termina: devuelve `true`. La `b` que sobra no importa.

## Errores comunes

- **Usar `revista.includes(letra)`** sin gastar las letras. `puedeEscribir("aa", "ab")` daría `true`, porque la `a` "está", aunque solo una vez. Lo reconoces en el test "la letra está pero no alcanza".
- **Contar la nota en vez de la revista** y olvidar comparar cantidades. Lo importante es que la revista tenga **al menos** lo que pide la nota.
- **Exigir que las cantidades sean iguales** (como en anagramas). Aquí a la revista le pueden sobrar letras: `("hola", "alohxyz")` es `true`.
- **Olvidar el `|| 0`** al contar: `undefined + 1` es `NaN` y nada funciona.
- **Pasar todo a minúsculas.** El enunciado distingue mayúsculas; `("A", "a")` debe ser `false`.

## Otra forma de resolverlo

**Buscar y tachar con `indexOf` y `splice`** (paso 1): O(n · m) de tiempo y O(m) de memoria por el arreglo. Muy intuitiva, pero lenta con textos largos.

**Contar con un `Map`**: idéntica a la oficial, con `get`, `set` y `has`. Útil si las claves no fueran texto.

**Arreglo de 26 posiciones**: si solo hubiera letras `a-z`, `conteo[letra.charCodeAt(0) - 97]++`. La memoria queda fija, O(1).

**¿Cuál conviene?** La de conteo: O(n + m) de tiempo, donde n y m son los largos de la nota y la revista, y O(k) de memoria, con k las letras distintas.

## Cómo explicarlo en la entrevista

> "La forma directa es buscar cada letra de la nota en la revista y tacharla, que es O(n · m). Mejor cuento cuántas veces tengo cada letra en la revista con un objeto, y luego voy gastándolas al recorrer la nota. Si me piden una letra que ya no tengo, devuelvo false. Es el mismo patrón de conteo que en anagramas: O(n + m) de tiempo y O(k) de memoria, con k las letras distintas de la revista."

## Conceptos

- **Conteo con objeto**: `obj[clave] = (obj[clave] || 0) + 1`.
- **Gastar un conteo**: restar mientras recorres el segundo texto.
- **Valores falsy**: `0` y `undefined` hacen que `!valor` sea `true`.
- **`indexOf` y `splice` son O(n)**: usarlos dentro de un bucle da O(n²).
- **Reutilizar patrones**: anagramas, ransom note y group anagrams usan la misma idea de contar letras.
