Mira este código. Programa tres `setTimeout` dentro de un bucle con `var`, y cada uno guarda el valor de `i` en `salida`:

```js
function conVar(n) {
  const salida = [];
  for (var i = 0; i < n; i++) {
    setTimeout(() => salida.push(i), 0);
  }
  return salida;
}

const salida = conVar(3);
// ... cuando ya corrieron los setTimeout ...
console.log(salida); // ¿?
```

Tienes que hacer dos cosas:

1. **Predecir**: exporta la constante `prediccion` con el arreglo que crees que queda en `salida` después de que corren los tres `setTimeout` de `conVar(3)`. Primero piénsalo sin ejecutar nada.
2. **Arreglar**: escribe `arreglado(n)`, igual que `conVar` (con un `setTimeout` por vuelta), pero que deje en el arreglo los números `0, 1, ..., n - 1`.

## Reglas

- `arreglado(n)` devuelve el arreglo **de inmediato**. Justo después de llamarla está vacío; se llena cuando corren los `setTimeout`.
- Debe seguir usando un `setTimeout` por vuelta: el reto es arreglar el bucle, no quitar el temporizador.
- Con `n = 0` el arreglo queda vacío.

## Ejemplos

```js
const resultado = arreglado(3);
resultado;   // []  (los setTimeout todavía no corrieron)
// ... después ...
resultado;   // [0, 1, 2]

arreglado(5); // después: [0, 1, 2, 3, 4]
```

## Por qué importa

Es la pregunta trampa más famosa de JavaScript. La usan para ver si entiendes tres cosas a la vez: la diferencia entre `var` y `let`, qué es un closure y que un `setTimeout` corre **después** de que termina el código síncrono. El mismo error aparece en código real cuando agregas eventos a botones dentro de un bucle.
