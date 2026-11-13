Escribe la función `clonar(valor)` que haga una **copia profunda**: un valor nuevo, con objetos y arreglos anidados también nuevos, de modo que cambiar la copia **nunca** afecte al original.

## Reglas

- Los primitivos (números, textos, booleanos, `null`, `undefined`) se devuelven tal cual.
- Los arreglos se copian elemento por elemento, y cada elemento también se clona.
- Los objetos se copian clave por clave, y cada valor también se clona.
- Las fechas (`Date`) se copian como una fecha **nueva** con el mismo momento.
- No uses `structuredClone` ni `JSON.parse(JSON.stringify(...))`: el reto es hacerlo a mano.
- No necesitas manejar referencias circulares, `Map`, `Set` ni clases propias.

## Ejemplos

```js
const original = { a: 1, b: { c: [1, 2, { d: 3 }] }, f: new Date(0) };
const copia = clonar(original);

copia.b.c[2].d = 99;
original.b.c[2].d;            // 3: el original no cambió

copia.f instanceof Date;      // true
copia.f === original.f;       // false: es otra fecha
copia.f.getTime();            // 0: pero con el mismo momento
```

## Por qué importa

En React y Redux el estado no se modifica: se copia. Si copias mal, cambias el estado "viejo" sin querer y la interfaz no se actualiza o muestra datos raros. La pregunta "¿cuál es la diferencia entre copia superficial y profunda?" es fija en entrevistas, y escribir el clon a mano demuestra que dominas la recursión y las referencias.
