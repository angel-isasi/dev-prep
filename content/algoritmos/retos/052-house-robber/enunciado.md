Escribe la función `robarCasas(casas)` que reciba un arreglo con el **dinero** que hay en cada casa de una calle, en orden, y devuelva el **máximo** que se puede juntar sin tomar nunca de **dos casas vecinas** (una al lado de la otra).

Es el clásico problema del ladrón: si entra a dos casas seguidas, suena la alarma.

## Reglas

- Los montos son enteros mayores o iguales a 0.
- Puedes saltarte las casas que quieras, incluso varias seguidas.
- Si no hay casas (`[]`), devuelve `0`.
- Devuelve el monto máximo, no qué casas elegiste.

## Ejemplos

```js
robarCasas([1, 2, 3, 1]);      // 4    casas 0 y 2: 1 + 3
robarCasas([2, 7, 9, 3, 1]);   // 12   casas 0, 2 y 4: 2 + 9 + 1
robarCasas([2, 1, 1, 2]);      // 4    casas 0 y 3: te saltas dos seguidas
robarCasas([5]);               // 5
robarCasas([]);                // 0
```

## Reto extra

Resuélvelo en **una sola pasada** O(n) y con memoria **O(1)**: solo necesitas recordar dos números mientras avanzas.
