Escribe la función `reducir(lista, fn, inicial)` que haga lo mismo que `Array.prototype.reduce`: recorre el array y va **acumulando** un solo valor. En cada vuelta llama a `fn(acumulado, elemento, indice)`, y lo que devuelve `fn` pasa a ser el `acumulado` de la siguiente vuelta. Al final devuelve el acumulado.

## Reglas

- No uses `reduce`, `forEach` ni otros métodos de array que recorran por ti: usa un bucle.
- En la primera vuelta, `acumulado` vale `inicial`.
- El valor inicial siempre se pasa. Puede ser un número, un texto, un array o un objeto.
- Si el array está vacío, devuelve `inicial` sin llamar a `fn`.

## Ejemplos

```js
reducir([1, 2, 3, 4], (a, b) => a * b, 1);  // 24
reducir([1, 2, 3, 4], (a, b) => a + b, 0);  // 10
reducir(["a", "b", "a"], (conteo, letra) => {
  conteo[letra] = (conteo[letra] ?? 0) + 1;
  return conteo;
}, {});                                       // { a: 2, b: 1 }
reducir([], (a, b) => a + b, 100);           // 100
```

## Por qué importa

`reduce` es el método de array que más cuesta entender y el que más aparece en entrevistas: sumar un carrito, contar votos, agrupar datos. Si lo construyes tú mismo, entiendes de una vez que solo es un bucle con una variable que acumula.
