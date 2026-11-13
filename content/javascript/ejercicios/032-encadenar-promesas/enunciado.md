Ya tienes la función `sumarLento(a, b)`: devuelve una **promesa** que se cumple con `a + b` después de 10 ms (imagina que es una API lenta). Escribe la función `sumarTres(a, b, c)` que sume los tres números **usando dos llamadas a `sumarLento`** y devuelva una promesa con el total.

## Reglas

- No sumes con `+` directamente: la gracia es usar `sumarLento` dos veces, una para `a + b` y otra para sumarle `c` a ese resultado.
- La segunda llamada necesita el resultado de la primera, así que van **una después de otra**: el total debe estar listo a los 20 ms, no antes.
- `sumarTres` debe devolver una promesa.
- No modifiques `sumarLento`.

## Ejemplos

```js
await sumarLento(2, 3);        // 5 (después de 10 ms)

await sumarTres(1, 2, 3);      // 6 (después de 20 ms)
await sumarTres(10, -4, 0);    // 6
await sumarTres(0, 0, 0);      // 0
```

## Por qué importa

En el trabajo real casi nunca haces una sola petición: pides el usuario, con su id pides sus pedidos, con el pedido pides el envío. Cada paso depende del anterior. Saber encadenar promesas, y saber que lo que devuelves en una función `async` se convierte en promesa, es la base de todo eso.
