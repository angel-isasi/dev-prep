Escribe y exporta la clase `Voto`, que representa un voto por una canción. La clase debe llevar la **cuenta total** de votos creados, y esa cuenta pertenece a la clase, no a cada voto.

## Reglas

- `new Voto(corto)` guarda el texto en `this.corto` y suma 1 al total de votos.
- `Voto.desde(texto)`: un método **de la clase** (no de cada voto) que limpia el texto (quita espacios a los costados y lo pasa a minúsculas) y devuelve un `new Voto` con ese texto limpio.
- `Voto.total`: cuántos votos se han creado en total, contando los hechos con `new` y con `Voto.desde`. Se lee desde la clase.
- `Voto.total` es de **solo lectura**: `Voto.total = 100` debe lanzar un error y el total no cambia. Guarda el contador en un campo estático privado y exponlo con un getter estático.
- Un voto individual no tiene `total` ni `desde`: `voto.total` y `voto.desde` son `undefined`.

## Ejemplos

```js
Voto.total;                                  // 0

const v1 = Voto.desde("  Bajo La Arena ");
v1.corto;                                    // "bajo la arena"

const v2 = new Voto("luz de desierto");
Voto.total;                                  // 2
v2.total;                                    // undefined (es de la clase)
v2 instanceof Voto;                          // true

Voto.total = 100;                            // ❌ TypeError
```

## Por qué importa

Los miembros estáticos sirven para lo que es **de todos** y no de uno: contadores, configuraciones y "métodos de fábrica" como `Voto.desde`. Ya los usas sin saberlo: `Array.from`, `Object.keys`, `Number.isFinite` y `Math.max` son métodos estáticos. En entrevistas preguntan la diferencia entre un método estático y uno de instancia.
