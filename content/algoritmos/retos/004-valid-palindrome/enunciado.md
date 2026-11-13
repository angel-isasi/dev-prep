Escribe la función `esPalindromo(s)` que reciba una frase y devuelva `true` si se lee igual de izquierda a derecha que de derecha a izquierda, **ignorando mayúsculas, espacios y signos de puntuación**.

## Reglas

- Solo cuentan las letras de la `a` a la `z` (sin tildes) y los dígitos del `0` al `9`. Todo lo demás se ignora.
- `"A"` y `"a"` se consideran iguales.
- Los dígitos **sí** cuentan: `"0P"` no es palíndromo.
- Una cadena vacía, o sin ningún carácter válido (por ejemplo `" "`), es palíndromo.

## Ejemplos

```js
esPalindromo("A man, a plan, a canal: Panama");  // true   ("amanaplanacanalpanama")
esPalindromo("Anita lava la tina");              // true
esPalindromo("race a car");                      // false  ("raceacar")
esPalindromo(" ");                               // true
esPalindromo("0P");                              // false
```

## Reto extra

La forma natural es crear una cadena limpia y compararla, lo que usa O(n) de memoria. ¿Puedes hacerlo con **O(1) de memoria extra**, sin crear cadenas nuevas, saltando con dos punteros los caracteres que no cuentan?
