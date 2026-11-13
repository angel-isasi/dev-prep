Escribe la función `esAnagrama(a, b)` que reciba dos palabras y devuelva `true` si son **anagramas**: tienen exactamente las mismas letras, **con las mismas cantidades**, aunque en otro orden.

## Reglas

- Las palabras vienen en minúsculas y sin espacios.
- No basta con que usen las mismas letras: también deben repetirse las mismas veces. `"aab"` y `"abb"` **no** son anagramas.
- Si tienen largos distintos, no pueden ser anagramas.
- Dos cadenas vacías son anagramas.

## Ejemplos

```js
esAnagrama("anagram", "nagaram");  // true
esAnagrama("roma", "amor");        // true
esAnagrama("rat", "car");          // false
esAnagrama("a", "ab");             // false  largos distintos
esAnagrama("aab", "abb");          // false  mismas letras, distintas cantidades
```

## Reto extra

Ordenar las dos palabras y compararlas funciona, pero es O(n log n). ¿Puedes resolverlo en **O(n)** contando letras?
