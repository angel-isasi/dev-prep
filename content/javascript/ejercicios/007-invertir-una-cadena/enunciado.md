Escribe la función `invertir(texto)` que reciba un texto y lo devuelva **al revés**, carácter por carácter.

## Reglas

- Se invierte todo: letras, espacios y signos.
- Respeta mayúsculas y minúsculas tal como vienen (la `R` de `"Rimay"` queda al final, y sigue siendo mayúscula).
- Un texto vacío devuelve `""`.
- Los **emojis** deben quedar intactos: `"ab😀"` se invierte a `"😀ba"`, no a símbolos raros.

## Ejemplos

```js
invertir("Rimay");        // "yamiR"
invertir("hola mundo");   // "odnum aloh"
invertir("a");            // "a"
invertir("");             // ""
invertir("ab😀");         // "😀ba"
```

## Por qué importa

Es de los ejercicios más pedidos en entrevistas junior, a veces como paso previo a "¿es palíndromo?". Muestra si sabes pasar de texto a arreglo y de vuelta. Lo de los emojis es un detalle que suma puntos: demuestra que sabes que un emoji no siempre es "un carácter" para JavaScript.
