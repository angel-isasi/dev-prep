Escribe la función `esFeliz(n)` que reciba un entero positivo y devuelva `true` si es un **número feliz**, o `false` si no.

Un número es feliz si, al repetir este proceso, llegas a `1`:

1. Reemplaza el número por la **suma de los cuadrados de sus dígitos**.
2. Repite con el resultado.

Si llegas a `1`, el número es feliz. Si no es feliz, el proceso **nunca** llega a 1: se queda dando vueltas en un ciclo para siempre.

Por ejemplo, con `19`:

```
1² + 9² = 1 + 81 = 82
8² + 2² = 64 + 4 = 68
6² + 8² = 36 + 64 = 100
1² + 0² + 0² = 1        ¡feliz!
```

## Reglas

- `n` es un entero mayor o igual a 1.
- El `1` ya es feliz (llegaste sin dar ningún paso).
- Tu función tiene que **terminar siempre**, también con los números que no son felices.

## Ejemplos

```js
esFeliz(19);   // true    19 -> 82 -> 68 -> 100 -> 1
esFeliz(7);    // true    7 -> 49 -> 97 -> 130 -> 10 -> 1
esFeliz(2);    // false   2 -> 4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4 -> ...
esFeliz(1);    // true
```

## Reto extra

La clave es detectar cuándo entras en un ciclo. Con un `Set` de números ya vistos es directo. ¿Puedes detectarlo **sin memoria extra**, con dos punteros que avanzan a distinta velocidad (la tortuga y la liebre)?
