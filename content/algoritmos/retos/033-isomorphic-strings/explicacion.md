## Idea clave

Recorres las dos cadenas a la vez y cada posición forma una pareja `s[i] -> t[i]`. Guardas las parejas en **dos `Map`**, uno en cada sentido, y en cuanto una pareja nueva contradice a una anterior, devuelves `false`. Hace falta revisar los dos sentidos porque hay dos reglas: un carácter no puede ir a dos destinos, y dos caracteres no pueden ir al mismo destino.

## Paso a paso

1. **La solución directa** (dila en voz alta): comparar el "patrón" de cada posición con todas las anteriores. Para cada par `i`, `j`, si `s[i] === s[j]` entonces también debe cumplirse `t[i] === t[j]`, y al revés. Son dos bucles: O(n²).

   ```js
   for (let i = 0; i < s.length; i++) {
     for (let j = 0; j < i; j++) {
       if ((s[i] === s[j]) !== (t[i] === t[j])) return false;
     }
   }
   return true;
   ```

2. **Guarda las parejas en vez de compararlas todas.** Si ya sabes que la `e` va a la `a`, no necesitas buscar hacia atrás: basta con mirar un `Map`.
3. **Primera regla, de `s` hacia `t`.** `deSaT` guarda a qué carácter va cada carácter de `s`. Si `s[i]` ya está y apunta a algo distinto de `t[i]`, un carácter iría a dos destinos: `false`. Esto atrapa `"foo"` y `"bar"`.
4. **Segunda regla, de `t` hacia `s`.** `deTaS` guarda de qué carácter viene cada carácter de `t`. Si `t[i]` ya está y viene de algo distinto de `s[i]`, dos caracteres irían al mismo destino: `false`. Esto atrapa `"badc"` y `"baba"`.
5. **Si no hay conflicto**, guarda la pareja en los dos `Map` y sigue. Si terminas, devuelve `true`.

```js
export function sonIsomorfas(s, t) {
  const deSaT = new Map();
  const deTaS = new Map();

  for (let i = 0; i < s.length; i++) {
    const a = s[i];
    const b = t[i];
    if (deSaT.has(a) && deSaT.get(a) !== b) return false;
    if (deTaS.has(b) && deTaS.get(b) !== a) return false;
    deSaT.set(a, b);
    deTaS.set(b, a);
  }

  return true;
}
```

## Por qué funciona

Recorrido con `sonIsomorfas("badc", "baba")`, el caso trampa:

| `i` | Pareja | `deSaT` antes | `deTaS` antes | ¿Conflicto? |
|---|---|---|---|---|
| 0 | `b -> b` | `{}` | `{}` | no |
| 1 | `a -> a` | `{ b: b }` | `{ b: b }` | no |
| 2 | `d -> b` | `{ b: b, a: a }` | `{ b: b, a: a }` | **sí**: la `b` de `t` ya viene de `b`, no de `d` |

Fíjate que en `i = 2` el `Map` de `s` hacia `t` no ve ningún problema: la `d` es nueva. Solo el `Map` al revés detecta que la `b` de `t` ya estaba ocupada. Si usaras un solo `Map`, seguirías con `c -> a` y devolverías `true`, que es incorrecto.

Con `"egg"` y `"add"`: `e -> a`, `g -> d`, y otra vez `g -> d`, que coincide con lo guardado. Nunca hay conflicto: `true`.

## Errores comunes

- **Revisar un solo sentido.** Es el error más frecuente. Lo reconoces en el test `"badc"` y `"baba"` (o `"ab"` y `"aa"`): devuelves `true` cuando debería ser `false`.
- **Comparar solo la cantidad de caracteres distintos** (`new Set(s).size === new Set(t).size`). No mira el orden: `"aab"` y `"abb"` tienen 2 distintos cada una, pero no son isomorfas.
- **Usar `if (deSaT.get(a))`** para preguntar si existe. Funciona con letras, pero es frágil: usa `has` para preguntar si está y `get` para leer el valor.
- **Guardar la pareja antes de revisar.** Si haces `set` primero, la comparación siempre coincide consigo misma y nunca encuentras el conflicto.

## Otra forma de resolverlo

**Doble bucle comparando patrones** (paso 1): O(n²) de tiempo y O(1) de memoria.

**Comparar la primera aparición**: dos cadenas son isomorfas si, en cada posición, el carácter de `s` y el de `t` aparecieron por primera vez en el mismo índice.

```js
for (let i = 0; i < s.length; i++) {
  if (s.indexOf(s[i]) !== t.indexOf(t[i])) return false;
}
return true;
```

Es muy corta y bonita, pero cada `indexOf` recorre la cadena: O(n²).

**Un `Map` y un `Set`**: `deSaT` para la primera regla y un `Set` de "destinos ya usados" para la segunda. Es la misma idea con otra estructura.

**¿Cuál conviene?** La de dos `Map`: O(n) de tiempo y O(k) de memoria, con k los caracteres distintos. La de `indexOf` es buena para explicar la idea de "mismo patrón", pero en la entrevista conviene terminar con la O(n).

## Cómo explicarlo en la entrevista

> "Recorro las dos cadenas a la vez, y cada posición forma una pareja de s hacia t. Tengo que revisar dos reglas: que un carácter de s no vaya a dos destinos distintos, y que dos caracteres de s no vayan al mismo destino. Por eso uso dos Map, uno en cada sentido; si una pareja nueva contradice algo guardado, devuelvo false. El caso que justifica el segundo Map es badc y baba. Queda O(n) de tiempo y O(k) de memoria, con k los caracteres distintos."

## Conceptos

- **Mapeo uno a uno (biyección)**: cada elemento va a uno solo, y ningún destino se comparte.
- **Dos `Map` para los dos sentidos**: un `Map` solo garantiza una de las dos reglas.
- **`has` antes de `get`**: preguntar si existe y luego leer.
- **Revisar antes de guardar**: el orden de las operaciones importa.
- **Patrón de una cadena**: la misma idea aparece en Word Pattern.
