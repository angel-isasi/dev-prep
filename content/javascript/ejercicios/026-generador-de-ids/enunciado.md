Escribe la función `crearIds(prefijo)` que devuelva una función generadora de ids. Cada vez que llamas a esa función, devuelve un texto nuevo con el formato `"prefijo-numero"`, donde el número empieza en `1` y aumenta de uno en uno.

## Reglas

- El primer id es `prefijo-1`, el segundo `prefijo-2`, y así.
- Cada generador lleva su propia numeración: crear un generador nuevo no afecta a los demás.
- No uses variables globales para el contador.

## Ejemplos

```js
const idPedido = crearIds("pedido");
idPedido();          // "pedido-1"
idPedido();          // "pedido-2"
idPedido();          // "pedido-3"

const idVoto = crearIds("voto");
idVoto();            // "voto-1"  (empieza su propia cuenta)
idPedido();          // "pedido-4"
```

## Por qué importa

Generar ids únicos es algo que harás de verdad en el frontend: claves para elementos de una lista en React, ids para tareas nuevas en una app de pendientes. Y es el ejemplo perfecto de closure con estado privado que te pueden pedir en una entrevista en 5 minutos.
