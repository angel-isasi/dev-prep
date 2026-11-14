Escribe la función `cambioMonedas(monedas, monto)` que reciba un arreglo con los **valores de las monedas** disponibles y un **monto**, y devuelva la **menor cantidad de monedas** que suman exactamente ese monto.

Tienes **monedas ilimitadas** de cada valor: puedes usar la misma moneda todas las veces que quieras. Si no hay ninguna forma de formar el monto, devuelve `-1`.

## Reglas

- Las monedas son enteros positivos y no se repiten en el arreglo.
- El monto es un entero mayor o igual a 0. Para el monto `0` se necesitan `0` monedas.
- Devuelve un número (la cantidad), no la lista de monedas.
- Ojo: tomar siempre la moneda más grande **no** siempre da la respuesta correcta.

## Ejemplos

```js
cambioMonedas([1, 2, 5], 11);   // 3    5 + 5 + 1
cambioMonedas([2], 3);          // -1   con monedas de 2 nunca llegas a 3
cambioMonedas([1], 0);          // 0
cambioMonedas([1, 3, 4], 6);    // 2    3 + 3 (y no 4 + 1 + 1)
```

## Reto extra

La recursión que prueba todas las combinaciones explota en tiempo. Guarda la respuesta de cada monto chico para no recalcularla y llega a **O(monto × cantidad de monedas)**.
